// ---- Utilidades de almacenamiento ----
function getJSON(key, defaultValue) {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return defaultValue;
    }
}

function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ---- Usuarios de prueba ----
const USERS = [
    { username: "admin",     password: "1234", rol: "Administrador" },
    { username: "empleado1", password: "abcd", rol: "Empleado" }
];

function getCurrentUser() {
    const raw = localStorage.getItem("usuarioActual");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem("usuarioActual", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("usuarioActual");
    window.location.href = "index.html";
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "index.html";
    }
    return user;
}

// ---- Inicialización según página ----
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    switch (page) {
        case "login":
            initLogin();
            break;
        case "panel":
            initPanel();
            break;
        case "inventario":
            initInventario();
            break;
        case "empleados":
            initEmpleados();
            break;
        case "reporte-ventas":
            initReporteVentas();
            break;
        case "reporte-inventario":
            initReporteInventario();
            break;
    }
});

// ---- Página: login ----
function initLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuario = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();

        const encontrado = USERS.find(
            (u) => u.username === usuario && u.password === contrasena
        );

        if (encontrado) {
            setCurrentUser(encontrado);
            window.location.href = "panel.html";
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    });
}

// ---- Página: panel ----
function initPanel() {
    const user = requireAuth();
    const span = document.getElementById("nombre-usuario");
    if (span && user) {
        span.textContent = `${user.username} (${user.rol})`;
    }

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// ---- Página: inventario ----
function initInventario() {
    requireAuth();
    let inventario = getJSON("inventario", []);

    const form = document.getElementById("form-inventario");
    const tbody = document.getElementById("tabla-inventario");

    if (!form || !tbody) return;

    function render() {
        tbody.innerHTML = "";
        inventario.forEach((prod, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${prod.id}</td>
                <td>${prod.nombre}</td>
                <td>${prod.precio.toFixed(2)}</td>
                <td>${prod.cantidad}</td>
                <td>
                    <button class="btn btn-tabla" data-index="${index}">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll("button.btn-tabla").forEach((btn) => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.index, 10);
                inventario.splice(idx, 1);
                setJSON("inventario", inventario);
                render();
            });
        });
    }

    render();

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("producto-id").value.trim();
        const nombre = document.getElementById("producto-nombre").value.trim();
        const precio = parseFloat(
            document.getElementById("producto-precio").value
        );
        const cantidad = parseInt(
            document.getElementById("producto-cantidad").value,
            10
        );

        if (!id || !nombre || isNaN(precio) || isNaN(cantidad)) {
            alert("Completa todos los campos del producto.");
            return;
        }

        inventario.push({ id, nombre, precio, cantidad });
        setJSON("inventario", inventario);
        form.reset();
        render();
    });
}

// ---- Página: empleados ----
function initEmpleados() {
    requireAuth();
    let empleados = getJSON("empleados", []);

    const form = document.getElementById("form-empleado");
    const tbody = document.getElementById("tabla-empleados");

    if (!form || !tbody) return;

    function render() {
        tbody.innerHTML = "";
        empleados.forEach((emp) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${emp.id}</td>
                <td>${emp.nombre}</td>
                <td>${emp.puesto}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    render();

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("empleado-id").value.trim();
        const nombre = document.getElementById("empleado-nombre").value.trim();
        const puesto = document.getElementById("empleado-puesto").value.trim();

        if (!id || !nombre || !puesto) {
            alert("Completa todos los campos del empleado.");
            return;
        }

        empleados.push({ id, nombre, puesto });
        setJSON("empleados", empleados);
        form.reset();
        render();
    });
}

// ---- Página: reporte de ventas ----
function initReporteVentas() {
    requireAuth();
    let ventas = getJSON("ventas", null);

    // Si nunca se ha registrado nada, creamos algunos ejemplos
    if (!ventas) {
        ventas = [
            { id: "V001", nombre: "Juan Pérez", puesto: "Cajero", total: 950.50 },
            { id: "V002", nombre: "Ana López", puesto: "Vendedor", total: 1200.00 }
        ];
        setJSON("ventas", ventas);
    }

    const tbody = document.getElementById("tabla-ventas");
    if (!tbody) return;

    tbody.innerHTML = "";
    ventas.forEach((v) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${v.id}</td>
            <td>${v.nombre}</td>
            <td>${v.puesto}</td>
            <td>${v.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ---- Página: reporte de inventario ----
function initReporteInventario() {
    requireAuth();
    const form = document.getElementById("form-reporte-inventario");
    const tbody = document.getElementById("tabla-reporte-inventario");

    if (!form || !tbody) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const valor = parseInt(
            document.getElementById("stock-maximo").value,
            10
        );
        if (isNaN(valor)) {
            alert("Ingresa un número válido para el stock.");
            return;
        }

        const inventario = getJSON("inventario", []);
        const filtrados = inventario.filter((p) => p.cantidad <= valor);

        tbody.innerHTML = "";
        if (filtrados.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="3">No hay productos con stock menor o igual a ${valor}.</td>`;
            tbody.appendChild(tr);
            return;
        }

        filtrados.forEach((p) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.cantidad}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

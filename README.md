📘 README.md
## La Económica - App Base
Sistema completo para gestionar una tienda digital tipo convenience store, incluyendo ventas, inventario, clientes, empleados y reportes.

### 🚀 Instalación rápida
```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/la-economica.git
cd la-economica

# Instalar dependencias del backend y frontend
cd backend && npm install && cd ../frontend && npm install
```

#
### ▶️ Ejecutar en desarrollo
```bash
# Backend (Puerto 5000)
cd backend
npm run dev

# Frontend (Puerto 5173)
cd frontend
npm run dev
```

### 📦 Tecnologías principales
- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + MongoDB
- **Auth:** JWT + bcryptjs
- **UI Extra:** React Router, Context API
- **Test:** Jest + Supertest (por integrar)

### 📁 Estructura Modular
Separación por dominios funcionales: `auth`, `products`, `sales`, `clients`, `employees`, `reports`.

### 🗺️ Rutas clave (ejemplo)
- `POST /auth/login`
- `GET /products`
- `POST /sales/checkout`
- `GET /reports/sales`

---

### 🧪 Pruebas y calidad (pendientes)
- Unit tests y middleware validation
- Seguridad con express-validator
- Logs con Winston/Morgan

### 🧑‍💻 Autor
Ricitos / LearnLab Studio

> Prototipo abierto al escalado: roles, POS, notificaciones, pagos, apps móviles y más.

# 🍽️ Frontend Factu - Sistema de Gestión de Restaurante

Este proyecto corresponde al **frontend** del sistema de gestión de restaurante, encargado de la interacción con el usuario y la visualización en tiempo real de pedidos, mesas y facturación.

Está diseñado para integrarse con un backend basado en API REST, permitiendo operar en un entorno **multiempresa (SaaS)**.

---

## 🚀 Características Principales

El frontend permite gestionar de forma visual y dinámica la operación del restaurante:

* 📋 **Visualización del Menú**
  Consulta de productos organizados por categorías con imágenes y precios.

* 🪑 **Gestión de Mesas**
  Estado en tiempo real (ocupada, libre, en proceso).

* 🧾 **Gestión de Pedidos**
  Creación, edición y seguimiento de comandas.

* 💳 **Proceso de Pago**
  Interfaz para selección de métodos de pago y confirmación de pedidos.

* 🔐 **Autenticación de Usuarios**
  Acceso seguro mediante JWT conectado al backend.

---

## 🛠️ Stack Tecnológico

Desarrollado con tecnologías modernas para aplicaciones web:

* **Framework:** Angular
* **Lenguaje:** TypeScript
* **Estilos:** Bootstrap
* **Consumo API:** HTTP Client (REST)
* **Gestión de estado:** Servicios Angular

---

## 🧩 Arquitectura

El proyecto está estructurado en módulos y componentes reutilizables:

* 📦 **Components:** UI reutilizable
* 📄 **Pages:** Vistas principales (mesas, pedidos, login, etc.)
* 🔧 **Services:** Comunicación con backend
* 🔐 **Guards:** Protección de rutas
* 🌐 **Interceptors:** Manejo de token JWT

---

## ⚙️ Instalación y Ejecución

```bash
# Clonar repositorio
git clone https://github.com/brianandres54321-ux/FrontendRestaurante.git

# Entrar al proyecto
cd FrontendRestaurante

# Instalar dependencias
npm install

# Ejecutar aplicación
ng serve
```

Por defecto, la aplicación se ejecuta en:

👉 http://localhost:4200

---

## 🔗 Conexión con Backend

Este frontend consume un backend REST.

Asegúrate de configurar correctamente la URL del backend en:

```
src/environments/environment.ts
```

Ejemplo:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## ⚠️ Consideraciones Importantes

* Este proyecto depende completamente del backend para funcionar correctamente.
* No incluye persistencia local de datos.
* Requiere autenticación válida para acceder a módulos protegidos.

---

## 🧠 Observaciones

Este frontend está orientado a evolucionar hacia un modelo SaaS, por lo que su diseño permite escalar a múltiples empresas mediante autenticación y segmentación de datos desde el backend.

---

## 📌 Estado del Proyecto

En desarrollo activo. Pueden existir cambios en estructura, endpoints y funcionalidades.

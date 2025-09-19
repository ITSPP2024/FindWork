# 🚀 Instalación y Configuración - FindWork

## 📋 Requisitos Previos
- Node.js v16 o superior
- npm o yarn
- MySQL (opcional - funciona con datos simulados)

## 🔧 Instalación

### 1. Instalar Dependencias
```bash
# En la raíz del proyecto
npm install

# En el directorio client
cd client
npm install
cd ..
```

### 2. Configuración de Variables de Entorno (Opcional)
Crear archivo `.env` en la raíz del proyecto:
```env
JWT_SECRET=tu_clave_secreta_muy_segura
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
```

### 3. Configuración de Base de Datos (Opcional)
Si tienes MySQL instalado, configura:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin
DB_NAME=powerman
```

## 🏃‍♂️ Ejecutar la Aplicación

### Opción 1: Desarrollo Normal
```bash
npm start
```

### Opción 2: Con Variables Personalizadas
```bash
npm run start:dev
```

### Opción 3: Solo Servidor
```bash
npm run server
```

### Opción 4: Solo Cliente
```bash
npm run client
```

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001

## 👥 Credenciales de Prueba

### Empresa
- Email: `admin@techsolutions.com`
- Password: `demo` o `test`

### Empleado
- Email: `juan@email.com`
- Password: `demo` o `test`

### Administrador
- Email: `admin`
- Password: `admin`

## 📁 Estructura del Proyecto
```
FindWork/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express)
├── uploads/         # Archivos subidos
├── package.json     # Dependencias raíz
└── README.md        # Documentación
```

## 🔧 Solución de Problemas

### Problema: Dependencias faltantes
```bash
npm install
cd client && npm install
```

### Problema: Puerto ocupado
- Frontend: Cambiar puerto en `client/vite.config.js`
- Backend: Cambiar `PORT` en `server/index.js`

### Problema: Variables de entorno en Windows
Usar `cross-env` (ya incluido):
```bash
npm run start:dev
```
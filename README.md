# CRUD API - Sistema de Gestión de Proyectos y Pases de Salida

Una aplicación CRUD completa desarrollada con Node.js y Express, basada en el esquema de base de datos proporcionado. El sistema gestiona usuarios, proyectos, detalles de piezas, pases de salida y sus respectivos detalles.

## 📋 Esquema de Base de Datos

El sistema incluye las siguientes entidades:

- **usuarios**: Gestión de usuarios del sistema
- **Proyecto**: Información de proyectos
- **Detalle de Pieza**: Catálogo de piezas y componentes
- **Pase de Salida**: Registros de despacho vinculados a proyectos y usuarios
- **PaseSalidaDetalle**: Detalles específicos de cada pase de salida

## 🚀 Características

- ✅ API REST completa con operaciones CRUD para todas las entidades
- ✅ Base de datos SQLite integrada
- ✅ Validación de datos de entrada
- ✅ Manejo de errores robusto
- ✅ Relaciones entre entidades correctamente implementadas
- ✅ Datos de muestra incluidos
- ✅ Documentación completa de la API

## 🛠️ Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

### Pasos de instalación

1. **Clonar o descargar el proyecto**
   ```bash
   # Si tienes git
   git clone <repository-url>
   cd crud-express-app
   
   # O simplemente navegar al directorio del proyecto
   cd /ruta/al/proyecto
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación**
   ```bash
   # Modo desarrollo (con nodemon)
   npm run dev
   
   # Modo producción
   npm start
   ```

4. **Verificar que la aplicación esté funcionando**
   - Abre tu navegador o cliente HTTP (Postman, Insomnia, etc.)
   - Visita: `http://localhost:3000`
   - Deberías ver la información de la API

## 📚 Documentación de la API

### Base URL
```
http://localhost:3000/api
```

### Endpoints Disponibles

#### 1. Usuarios (`/api/usuarios`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Obtener todos los usuarios |
| GET | `/api/usuarios/:id` | Obtener usuario por ID |
| POST | `/api/usuarios` | Crear nuevo usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |
| GET | `/api/usuarios/:id/pases-salida` | Obtener pases de salida del usuario |

**Ejemplo de creación de usuario:**
```json
POST /api/usuarios
{
  "Nombre": "Juan Pérez",
  "Rol": "Administrador"
}
```

#### 2. Proyectos (`/api/proyectos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/proyectos` | Obtener todos los proyectos |
| GET | `/api/proyectos/:id` | Obtener proyecto por ID |
| POST | `/api/proyectos` | Crear nuevo proyecto |
| PUT | `/api/proyectos/:id` | Actualizar proyecto |
| DELETE | `/api/proyectos/:id` | Eliminar proyecto |
| GET | `/api/proyectos/:id/pases-salida` | Obtener pases de salida del proyecto |

**Ejemplo de creación de proyecto:**
```json
POST /api/proyectos
{
  "Orden de Venta": 1001,
  "Nombre": "Proyecto Alpha",
  "SEC": 12345
}
```

#### 3. Detalle de Pieza (`/api/detalle-pieza`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/detalle-pieza` | Obtener todas las piezas |
| GET | `/api/detalle-pieza/:id` | Obtener pieza por ID |
| POST | `/api/detalle-pieza` | Crear nueva pieza |
| PUT | `/api/detalle-pieza/:id` | Actualizar pieza |
| DELETE | `/api/detalle-pieza/:id` | Eliminar pieza |
| GET | `/api/detalle-pieza/:id/pase-salida-detalles` | Obtener detalles de pase de salida de la pieza |

**Ejemplo de creación de pieza:**
```json
POST /api/detalle-pieza
{
  "cantidad": 50,
  "Tipo": "Tornillo",
  "Marca": "Bosch"
}
```

#### 4. Pase de Salida (`/api/pase-salida`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pase-salida` | Obtener todos los pases de salida |
| GET | `/api/pase-salida/:id` | Obtener pase de salida por ID |
| POST | `/api/pase-salida` | Crear nuevo pase de salida |
| PUT | `/api/pase-salida/:id` | Actualizar pase de salida |
| DELETE | `/api/pase-salida/:id` | Eliminar pase de salida |
| GET | `/api/pase-salida/:id/detalles` | Obtener detalles del pase de salida |

**Ejemplo de creación de pase de salida:**
```json
POST /api/pase-salida
{
  "idProyecto": 1,
  "idUsuarios": 1
}
```

#### 5. Pase Salida Detalle (`/api/pase-salida-detalle`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pase-salida-detalle` | Obtener todos los detalles |
| GET | `/api/pase-salida-detalle/:id` | Obtener detalle por ID |
| POST | `/api/pase-salida-detalle` | Crear nuevo detalle |
| PUT | `/api/pase-salida-detalle/:id` | Actualizar detalle |
| DELETE | `/api/pase-salida-detalle/:id` | Eliminar detalle |
| GET | `/api/pase-salida-detalle/pase-salida/:id` | Obtener detalles por pase de salida |
| GET | `/api/pase-salida-detalle/detalle-pieza/:id` | Obtener detalles por pieza |

**Ejemplo de creación de detalle:**
```json
POST /api/pase-salida-detalle
{
  "idPaseSalida": 1,
  "idDetallePieza": 1,
  "Cantidad": 10
}
```

### Respuestas de la API

Todas las respuestas siguen el siguiente formato:

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Tipo de error",
  "message": "Descripción del error"
}
```

## 🗄️ Base de Datos

La aplicación utiliza SQLite como base de datos, que se crea automáticamente al iniciar la aplicación. El archivo de base de datos se genera en `database/database.sqlite`.

### Datos de Muestra

La aplicación incluye datos de muestra que se insertan automáticamente:

- **3 usuarios** con diferentes roles
- **3 proyectos** de ejemplo
- **3 tipos de piezas** diferentes
- **3 pases de salida** de ejemplo
- **4 detalles de pase de salida** vinculados

## 🔧 Estructura del Proyecto

```
crud-express-app/
├── database/
│   ├── database.js          # Configuración y conexión a la base de datos
│   └── database.sqlite      # Archivo de base de datos (se crea automáticamente)
├── models/
│   ├── usuarios.js          # Modelo de usuarios
│   ├── proyectos.js         # Modelo de proyectos
│   ├── detallePieza.js      # Modelo de detalle de pieza
│   ├── paseSalida.js        # Modelo de pase de salida
│   └── paseSalidaDetalle.js # Modelo de pase salida detalle
├── routes/
│   ├── usuarios.js          # Rutas de usuarios
│   ├── proyectos.js         # Rutas de proyectos
│   ├── detallePieza.js      # Rutas de detalle de pieza
│   ├── paseSalida.js        # Rutas de pase de salida
│   └── paseSalidaDetalle.js # Rutas de pase salida detalle
├── server.js                # Servidor principal
├── package.json             # Configuración del proyecto
└── README.md               # Este archivo
```

## 🧪 Pruebas de la API

### Usando cURL

```bash
# Obtener todos los usuarios
curl http://localhost:3000/api/usuarios

# Crear un nuevo usuario
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"Nombre": "Test User", "Rol": "Operador"}'

# Obtener un usuario específico
curl http://localhost:3000/api/usuarios/1
```

### Usando Postman

1. Importa la colección de Postman (si está disponible)
2. O crea requests manuales usando los endpoints documentados arriba
3. Asegúrate de configurar el Content-Type como `application/json` para requests POST/PUT

## 🚨 Manejo de Errores

La API incluye manejo de errores robusto:

- **400 Bad Request**: Datos de entrada inválidos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

## 🔄 Relaciones entre Entidades

- Un **usuario** puede tener múltiples **pases de salida**
- Un **proyecto** puede tener múltiples **pases de salida**
- Un **pase de salida** puede tener múltiples **detalles**
- Una **pieza** puede aparecer en múltiples **detalles de pase de salida**

## 📝 Notas Adicionales

- La aplicación incluye timestamps automáticos (`created_at`, `updated_at`)
- Las relaciones entre tablas están configuradas con CASCADE DELETE
- La validación de datos incluye verificación de tipos y valores requeridos
- El servidor se ejecuta en el puerto 3000 por defecto

## 🤝 Contribuciones

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Disfruta usando la API! 🚀**

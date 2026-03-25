# Manchita Skills - Instrucciones para levantar el proyecto

## Requisitos previos

- [Node.js](https://nodejs.org/) v20 o superior
- [npm](https://www.npmjs.com/) v10 o superior
- [Docker](https://www.docker.com/) y Docker Compose (para la base de datos)

---

## Estructura del proyecto

```
manchita-skills/
├── backend/      # API REST con NestJS + Prisma + PostgreSQL
├── frontend/     # SPA con Angular 21 + PrimeNG + TailwindCSS
└── package.json  # Workspace raiz con scripts unificados
```

---

## Configuracion inicial (primera vez)

### 1. Instalar dependencias

Desde la raiz del proyecto:

```bash
npm install
```

### 2. Configurar variables de entorno del backend

Copia el archivo de ejemplo y edita los valores segun tu entorno:

```bash
cp backend/.env.example backend/.env
```

Variables clave a configurar en `backend/.env`:

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `DATABASE_URL` | Cadena de conexion PostgreSQL | `postgresql://myuser:mypassword@localhost:5432/mydb?schema=public` |
| `JWT_SECRET` | Clave secreta para tokens JWT | *(cambiar por una clave segura)* |
| `JWT_EXPIRES_IN` | Duracion del access token | `1h` |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Duracion del refresh token en dias | `7` |
| `PORT` | Puerto del servidor backend | `3000` |
| `SMTP_USER` | Email para envio de correos | - |
| `SMTP_PASS` | Contrasena de aplicacion del email | - |
| `PASSWORD_RESET_URL` | URL del frontend para reset de contrasena | `http://localhost:4200/auth/new-password` |

> Las variables de AWS S3 solo son necesarias si se usa la funcionalidad de subida de archivos.

### 3. Levantar la base de datos con Docker

```bash
npm run backend:docker:up
```

Esto levanta un contenedor PostgreSQL 16 en el puerto `5432` con:
- Usuario: `myuser`
- Contrasena: `mypassword`
- Base de datos: `mydb`

Verifica que el contenedor este corriendo:

```bash
docker ps
```

### 4. Generar el cliente de Prisma

```bash
npm run backend:db:generate
```

### 5. Ejecutar las migraciones de base de datos

```bash
npm run backend:db:migrate
```

### 6. (Opcional) Poblar la base de datos con datos iniciales

```bash
npm run backend:db:seed
```

---

## Levantar el proyecto en desarrollo

Con todos los pasos de configuracion completados, ejecuta desde la raiz:

```bash
npm run dev
```

Esto levanta en paralelo:
- **Backend** en `http://localhost:3000`
- **Frontend** en `http://localhost:4200`

---

## URLs utiles

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:3000 |
| Swagger / Docs API | http://localhost:3000/api |

---

## Scripts disponibles

### Proyecto completo (desde la raiz)

```bash
npm run dev              # Levanta backend y frontend en desarrollo
npm run build            # Compila backend y frontend para produccion
npm run test             # Ejecuta tests de backend y frontend
```

### Backend

```bash
npm run backend:dev      # Servidor en modo watch
npm run backend:build    # Compilar para produccion
npm run backend:test     # Tests unitarios
npm run backend:lint     # Linting
npm run backend:format   # Formatear codigo

# Base de datos
npm run backend:db:generate   # Generar cliente Prisma
npm run backend:db:migrate    # Ejecutar migraciones
npm run backend:db:seed       # Poblar con datos iniciales
npm run backend:db:reset      # Resetear base de datos

# Docker
npm run backend:docker:up     # Levantar contenedor PostgreSQL
npm run backend:docker:down   # Detener contenedor
npm run backend:docker:reset  # Detener y eliminar volumenes
```

### Frontend

```bash
npm run frontend:start        # Servidor de desarrollo (ng serve)
npm run frontend:build        # Build de desarrollo
npm run frontend:build:prod   # Build de produccion
npm run frontend:test         # Tests con Vitest
npm run frontend:test:watch   # Tests en modo watch
npm run frontend:lint         # Linting
```

---

## Stack tecnologico

**Backend**
- [NestJS](https://nestjs.com/) 10
- [Prisma](https://www.prisma.io/) 6 (ORM)
- PostgreSQL 16
- JWT para autenticacion
- Swagger para documentacion de la API

**Frontend**
- [Angular](https://angular.dev/) 21
- [PrimeNG](https://primeng.org/) 21
- [TailwindCSS](https://tailwindcss.com/) 4
- [Vitest](https://vitest.dev/) para testing

---

## Solucion de problemas comunes

**Error: `@prisma/client did not initialize yet`**

Ejecuta el generador de Prisma:
```bash
npm run backend:db:generate
```

**Error: `ERESOLVE unable to resolve dependency tree` al hacer `npm install`**

Verifica que la version de TypeScript en `frontend/package.json` sea `~5.9.0` o superior (requerido por `@angular-devkit/build-angular@21`).

**Error de conexion a la base de datos**

1. Verifica que el contenedor Docker este corriendo: `docker ps`
2. Verifica que `DATABASE_URL` en `backend/.env` coincida con las credenciales del `docker-compose.dev.yml`
3. Levanta el contenedor si no esta corriendo: `npm run backend:docker:up`

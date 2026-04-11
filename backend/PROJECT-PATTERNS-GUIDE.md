# Guía de Patrones — NestJS Backend (Plantilla Base)

> **Propósito**: Plantilla reutilizable que documenta los patrones, librerías, configuraciones y convenciones base para construir cualquier backend con NestJS. Incluye los módulos core necesarios para el funcionamiento de cualquier proyecto: autenticación, usuarios, permisos, base de datos, email y almacenamiento de archivos.

---

## Tabla de Contenidos

1. [Stack Tecnológico y Librerías](#1-stack-tecnológico-y-librerías)
2. [Configuración del Proyecto (Bootstrap)](#2-configuración-del-proyecto-bootstrap)
3. [Configuración de Swagger / OpenAPI](#3-configuración-de-swagger--openapi)
4. [Estructura de Módulos](#4-estructura-de-módulos)
5. [Patrón de DTOs (Data Transfer Objects)](#5-patrón-de-dtos-data-transfer-objects)
6. [Patrón de Controladores (HTTP Methods)](#6-patrón-de-controladores-http-methods)
7. [Patrón de Servicios (Lógica de Negocio)](#7-patrón-de-servicios-lógica-de-negocio)
8. [Sistema de Autenticación (JWT)](#8-sistema-de-autenticación-jwt)
9. [Sistema de Permisos (RBAC)](#9-sistema-de-permisos-rbac)
10. [Prisma ORM (Base de Datos)](#10-prisma-orm-base-de-datos)
11. [Servicios Externos (Mail y S3)](#11-servicios-externos-mail-y-s3)
12. [Testing](#12-testing)
13. [DevOps y Calidad de Código](#13-devops-y-calidad-de-código)
14. [Convenciones de Nomenclatura](#14-convenciones-de-nomenclatura)

---

## 1. Stack Tecnológico y Librerías

### Dependencias de Producción

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `@nestjs/common` | ^10.0.0 | Framework NestJS — decoradores, pipes, guards, interceptors |
| `@nestjs/core` | ^10.0.0 | Núcleo del framework NestJS |
| `@nestjs/platform-express` | ^10.0.0 | Adaptador Express para NestJS |
| `@nestjs/config` | ^4.0.2 | Gestión de variables de entorno vía `.env` |
| `@nestjs/jwt` | ^11.0.1 | Generación y verificación de tokens JWT |
| `@nestjs/passport` | ^11.0.5 | Integración de Passport.js con NestJS |
| `@nestjs/swagger` | ^8.1.1 | Generación automática de documentación OpenAPI/Swagger |
| `@nestjs/mapped-types` | * | Utilidades para DTOs (`PartialType`, `OmitType`, `PickType`) |
| `@prisma/client` | ^6.19.0 | Cliente ORM para PostgreSQL |
| `@aws-sdk/client-s3` | ^3.705.0 | SDK de AWS para subir archivos a S3 |
| `bcrypt` | ^6.0.0 | Hashing de contraseñas (salt rounds: 10) |
| `class-transformer` | ^0.5.1 | Transformación de objetos planos a instancias de clase |
| `class-validator` | ^0.14.2 | Validación de DTOs con decoradores |
| `dotenv` | ^17.2.3 | Carga de variables de entorno desde `.env` |
| `nodemailer` | ^6.9.14 | Envío de correos electrónicos (SMTP/Gmail) |
| `passport` | ^0.7.0 | Middleware de autenticación |
| `passport-jwt` | ^4.0.1 | Estrategia JWT para Passport |
| `reflect-metadata` | ^0.2.0 | Soporte de metadata para decoradores TypeScript |
| `rxjs` | ^7.8.1 | Programación reactiva (dependencia core de NestJS) |

### Dependencias de Desarrollo

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `@nestjs/cli` | ^10.0.0 | CLI para generar módulos, controladores, servicios |
| `@nestjs/schematics` | ^10.0.0 | Plantillas para el CLI de NestJS |
| `@nestjs/testing` | ^10.0.0 | Utilidades para testing (TestingModule) |
| `prisma` | ^6.19.0 | CLI de Prisma (migraciones, seeds, generación) |
| `typescript` | ^5.1.3 | Compilador TypeScript |
| `jest` | ^29.5.0 | Framework de testing |
| `ts-jest` | ^29.1.0 | Transformador TypeScript para Jest |
| `supertest` | ^7.0.0 | Testing HTTP para pruebas e2e |
| `eslint` | ^8.57.1 | Linter para TypeScript |
| `prettier` | ^3.0.0 | Formateador de código |

---

## 2. Configuración del Proyecto (Bootstrap)

### Archivo `main.ts`

El archivo `src/main.ts` configura la aplicación con los siguientes elementos clave:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Trust proxy — necesario detrás de un load balancer para obtener IPs reales
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // 2. Prefijo global — todas las rutas comienzan con /api
  app.setGlobalPrefix('api');

  // 3. Validación global — rechaza propiedades desconocidas automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true,   // Lanza error si llegan propiedades extra
    }),
  );

  // 4. CORS — habilitado para todos los orígenes
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
  });

  // 5. Swagger (ver sección 3)
  // ...

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**Puntos clave:**
- `whitelist: true` + `forbidNonWhitelisted: true` en `ValidationPipe` asegura que solo las propiedades definidas en los DTOs sean aceptadas. Cualquier propiedad extra en el body genera un error `400 Bad Request`.
- El prefijo `/api` se aplica automáticamente a **todas** las rutas registradas.

### Guards Globales en `app.module.ts`

Los guards se registran como `APP_GUARD` en el módulo raíz, lo que los aplica automáticamente a **todas** las rutas sin necesidad de declararlos en cada controlador:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Variables de entorno disponibles en todos los módulos

    // ─── Módulos Core (incluidos en la plantilla base) ───
    AuthModule,
    UserModule,
    PermissionModule,
    PrismaModule,
    MailModule,
    AssetsModule,

    // ─── Módulos de Dominio (propios del proyecto) ───
    // Agregar aquí los módulos específicos del dominio de negocio
    // Ejemplo: ItemModule, OrderModule, ProductModule, etc.
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,      // PRIMERO: Autenticar (valida el JWT)
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,   // SEGUNDO: Autorizar (valida los permisos)
    },
  ],
})
export class AppModule {}
```

> **Nota importante:** El orden de los guards es relevante. Primero se ejecuta `JwtAuthGuard` (autenticación) y luego `PermissionGuard` (autorización). Si el JWT es inválido, el segundo guard nunca se ejecuta.

### TypeScript Config (`tsconfig.json`)

```jsonc
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "baseUrl": "./",                        // Permite importar desde 'src/...'
    "emitDecoratorMetadata": true,          // Requerido por NestJS para DI
    "experimentalDecorators": true,         // Requerido por NestJS para decoradores
    "strictNullChecks": false,              // Desactivado para facilitar desarrollo
    "noImplicitAny": false,                 // Permite `any` implícito (no recomendado en strict mode)
    "outDir": "./dist",
    "sourceMap": true,
    "incremental": true,
    "skipLibCheck": true
  }
}
```

---

## 3. Configuración de Swagger / OpenAPI

### Setup en `main.ts`

```typescript
const config = new DocumentBuilder()
  .setTitle('API')
  .setDescription('Documentacion de la API')
  .setVersion('1.0')
  .addTag('api')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      description: 'Introduce el token devuelto por /api/auth/login en el formato: Bearer <token>',
    },
    'access-token',   // <-- Este nombre se referencia en @ApiBearerAuth('access-token')
  )
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,  // El token se mantiene en el navegador al recargar
  },
});

// Endpoint para descargar el JSON del Swagger
app.getHttpAdapter().get('/api/docs-json', (req, res) => {
  res.json(document);
});
```

### URLs de Acceso

| URL | Descripción |
|-----|-------------|
| `/api/docs` | Interfaz visual de Swagger UI |
| `/api/docs-json` | Especificación OpenAPI en formato JSON |

### Decoradores Swagger Obligatorios en Controladores

Cada controlador y endpoint **debe** tener los siguientes decoradores:

```typescript
// A nivel de CLASE (controlador)
@ApiTags('nombre-modulo')              // Agrupa los endpoints en Swagger
@ApiBearerAuth('access-token')         // Muestra el botón de autenticación en Swagger

// A nivel de MÉTODO (endpoint)
@ApiOperation({ summary: 'Descripción breve del endpoint' })
@ApiResponse({ status: 200, type: ResponseDto })
@ApiResponse({ status: 400, type: ErrorResponseDto })
@ApiResponse({ status: 409, type: ErrorResponseDto })  // Si aplica
@ApiBody({ type: RequestDto })                          // Para POST/PATCH con body
```

### Lazy Resolvers (Evitar Dependencias Circulares)

En los response DTOs, **siempre** usar lazy resolvers en `@ApiProperty` cuando el tipo es una clase personalizada:

```typescript
// ✅ CORRECTO — Lazy resolver
@ApiProperty({ type: () => ItemDto })
res: ItemDto;

@ApiProperty({ type: () => [ItemDto] })   // Para arrays
res: ItemDto[];

// ❌ INCORRECTO — Referencia directa (puede causar dependencias circulares)
@ApiProperty({ type: ItemDto })
res: ItemDto;
```

---

## 4. Estructura de Módulos

### Anatomía de un Módulo

Cada módulo sigue una estructura de archivos consistente:

```
modulo/
├── modulo.controller.ts       # Endpoints REST (HTTP)
├── modulo.service.ts          # Lógica de negocio
├── modulo.module.ts           # Configuración del módulo NestJS
└── dto/
    ├── modulo.req.dto.ts      # DTOs de entrada (request)
    └── modulo.res.dto.ts      # DTOs de salida (response)
```

### Categorías de Módulos

El proyecto organiza los módulos en dos niveles:

#### Módulos Core (Infraestructura)

Incluidos en la plantilla base. Necesarios para el funcionamiento de cualquier proyecto:

| Módulo | Ruta | Responsabilidad |
|--------|------|-----------------|
| `auth` | `src/auth/` | Autenticación JWT, registro, login, refresh tokens |
| `user` | `src/user/` | Gestión de usuarios y roles |
| `permission` | `src/permission/` | Sistema RBAC de permisos |
| `prisma` | `src/prisma/` | Servicio de base de datos (global) |
| `mail` | `src/mail/` | Envío de correos electrónicos |
| `assets` | `src/assets/` | Subida de archivos a AWS S3 |

#### Módulos de Dominio (Específicos del Proyecto)

Agregar aquí los módulos propios del dominio de negocio. Se recomienda organizarlos por contexto o área funcional:

```
src/
├── auth/              # Core
├── user/              # Core
├── permission/        # Core
├── prisma/            # Core
├── mail/              # Core
├── assets/            # Core
│
├── catalogs/          # Datos maestros del dominio (opcional, módulo agregador)
│   ├── item/
│   ├── category/
│   └── status/
│
└── domain/            # Lógica de negocio principal (opcional, módulo agregador)
    ├── order/
    ├── invoice/
    └── report/
```

> **Nota:** Los nombres de las carpetas son ejemplos. Adaptar según el dominio del proyecto.

### Patrón de Módulo Simple

```typescript
// item.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  imports: [PrismaModule],                    // Importar módulo de base de datos
  controllers: [ItemController],               // Registrar controlador
  providers: [ItemService],                    // Registrar servicio
})
export class ItemModule {}
```

### Patrón de Módulo con Exportación

Cuando otro módulo necesita usar el servicio:

```typescript
// user.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],        // Exportar para que AuthModule pueda inyectarlo
})
export class UserModule {}
```

### Patrón de Módulo Agregador

Para agrupar múltiples submódulos relacionados:

```typescript
// domain.module.ts
@Module({
  imports: [
    OrderModule,
    InvoiceModule,
    ReportModule,
    // ... otros submódulos del dominio
  ],
})
export class DomainModule {}
```

---

## 5. Patrón de DTOs (Data Transfer Objects)

### Request DTO — Entrada de Datos

**Convención de nombre**: `*.req.dto.ts`

```typescript
// item.req.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateItemRequestDto {
  @ApiProperty()                    // Documenta el campo en Swagger
  @IsString()                      // Valida que sea string
  codigo: string;

  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })  // Campo opcional en Swagger
  @IsString()
  @IsOptional()                      // Permite que no venga en el body
  descripcion?: string | null;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
```

### Update DTO — Todos los campos opcionales

```typescript
export class UpdateItemRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  codigo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string | null;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
```

### Response DTO — Salida de Datos

**Convención de nombre**: `*.res.dto.ts`

Todos los endpoints retornan la misma estructura: `{ res, code, message }`

```typescript
// item.res.dto.ts
import { ApiProperty } from '@nestjs/swagger';

// 1. DTO de la entidad (como se ve en la respuesta)
export class ItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  descripcion?: string | null;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// 2. Response para obtener TODOS (array)
export class GetAllItemResponseDto {
  @ApiProperty({ type: () => [ItemDto] })   // Array con lazy resolver
  res: ItemDto[];

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

// 3. Response para obtener UNO / crear / actualizar
export class CreateItemResponseDto {
  @ApiProperty({ type: () => ItemDto })      // Objeto con lazy resolver
  res: ItemDto;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}

// 4. DTO de error (se repite en cada módulo)
export class ErrorResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;
}
```

### Estructura Estándar de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `res` | `T \| T[] \| null` | Datos de la respuesta |
| `code` | `number` | `0` = éxito, `>0` = error |
| `message` | `string` | Mensaje descriptivo en español |

### Decoradores de Validación Usados

| Decorador | Propósito | Ejemplo |
|-----------|-----------|---------|
| `@IsString()` | Valida que sea string | Campos de texto |
| `@IsNumber()` | Valida que sea número | IDs, cantidades |
| `@IsBoolean()` | Valida que sea booleano | `activo` |
| `@IsOptional()` | Permite campo ausente | Campos opcionales |
| `@IsEmail()` | Valida formato de email | `email` |
| `@MinLength(n)` | Longitud mínima | Contraseñas (6) |
| `@IsDateString()` | Valida formato ISO de fecha | Fechas |
| `@IsEnum(Enum)` | Valida contra un enum | Estados |
| `@IsArray()` | Valida que sea array | Listas de IDs |
| `@Type(() => Number)` | Transforma a tipo específico | `class-transformer` |

---

## 6. Patrón de Controladores (HTTP Methods)

### Estructura Completa de un Controlador

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators';

// ─── Decoradores a nivel de CLASE ───────────────────────────────────────────
@ApiBearerAuth('access-token')                    // 1. Documentación de auth en Swagger
@ApiTags('item')                                   // 2. Agrupación en Swagger
@UseGuards(JwtAuthGuard, PermissionGuard)         // 3. Guards de auth + permisos
@Controller('item')                                // 4. Prefijo de ruta
export class ItemController {
  constructor(private readonly service: ItemService) {}

  // ─── CREATE ─────────────────────────────────────────────────────────────
  @Post('create')
  @RequirePermission('item:create')
  @ApiOperation({ summary: 'Crea un nuevo ítem' })
  @ApiBody({ type: CreateItemRequestDto })
  @ApiResponse({ status: 200, type: CreateItemResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 409, type: ErrorResponseDto })
  create(@Body() dto: CreateItemRequestDto) {
    return this.service.create(dto);
  }

  // ─── READ ALL ───────────────────────────────────────────────────────────
  @Get('all')
  @RequirePermission('item:read')
  @ApiOperation({ summary: 'Obtiene todos los ítems' })
  @ApiResponse({ status: 200, type: GetAllItemResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findAll() {
    return this.service.findAll();
  }

  // ─── READ ONE ───────────────────────────────────────────────────────────
  @Get(':id')
  @RequirePermission('item:read')
  @ApiOperation({ summary: 'Obtiene un ítem por ID' })
  @ApiResponse({ status: 200, type: CreateItemResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);     // +id convierte string a number
  }

  // ─── UPDATE ─────────────────────────────────────────────────────────────
  @Patch(':id')
  @RequirePermission('item:update')
  @ApiOperation({ summary: 'Actualiza un ítem' })
  @ApiBody({ type: UpdateItemRequestDto })
  @ApiResponse({ status: 200, type: CreateItemResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateItemRequestDto) {
    return this.service.update(+id, dto);
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────
  @Delete(':id')
  @RequirePermission('item:delete')
  @ApiOperation({ summary: 'Elimina un ítem' })
  @ApiResponse({ status: 200, type: CreateItemResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
```

### Stack de Decoradores por Endpoint

El orden de declaración de decoradores sigue este patrón:

```
1. @Post('ruta') / @Get('ruta') / @Patch('ruta') / @Delete('ruta')   ← Verbo HTTP
2. @RequirePermission('modulo:accion')                                 ← Permiso requerido
3. @ApiOperation({ summary: '...' })                                   ← Descripción Swagger
4. @ApiBody({ type: RequestDto })                                      ← Solo POST/PATCH
5. @ApiResponse({ status: 200, type: ResponseDto })                    ← Respuesta exitosa
6. @ApiResponse({ status: 4xx, type: ErrorResponseDto })               ← Respuestas de error
```

### Convención de Rutas HTTP

**Módulos de catálogo** (CRUD simple):
| Método | Ruta | Acción |
|--------|------|--------|
| `GET` | `/all` | Obtener todos |
| `POST` | `/create` | Crear nuevo |
| `GET` | `/:id` | Obtener uno por ID |
| `PATCH` | `/:id` | Actualizar parcialmente |

**Módulos de dominio** (relaciones complejas):
| Método | Ruta | Acción |
|--------|------|--------|
| `GET` | `/all` | Obtener todos |
| `POST` | `/create` | Crear nuevo |
| `GET` | `/:id` | Obtener uno |
| `GET` | `/entity/:entityId` | Filtrar por relación |
| `PATCH` | `/:entityAId/:entityBId` | Actualizar por clave compuesta |
| `DELETE` | `/:entityAId/:entityBId` | Eliminar por clave compuesta |

### Endpoint de File Upload

```typescript
@Post('upload')
@RequirePermission('assets:upload')
@ApiConsumes('multipart/form-data')
@UseInterceptors(FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },   // 5MB
}))
uploadAsset(
  @UploadedFile(new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
      new FileTypeValidator({ fileType: /^image\/(png|jpe?g|gif|webp)$/i }),
    ],
  })) file: Express.Multer.File,
) {
  return this.assetsService.uploadFile(file);
}
```

---

## 7. Patrón de Servicios (Lógica de Negocio)

### Servicio CRUD de Catálogo (Plantilla Base)

```typescript
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  // ─── CREATE ─────────────────────────────────────────────────────────────
  async create(dto: CreateItemRequestDto) {
    // 1. Normalizar datos de entrada
    const codigo = dto.codigo.trim().toUpperCase();
    const nombre = dto.nombre.trim();
    const descripcion = dto.descripcion?.trim();
    const activo = dto.activo ?? true;

    // 2. Validar unicidad
    const existing = await this.prisma.item.findUnique({
      where: { codigo },
    });
    if (existing) {
      throw new ConflictException({ message: 'El codigo ya existe', code: 1 });
    }

    // 3. Crear registro
    const nuevo = await this.prisma.item.create({
      data: { codigo, nombre, descripcion: descripcion ?? null, activo },
    });

    // 4. Retornar con estructura estándar
    return {
      res: nuevo,
      code: 0,
      message: 'Item creado correctamente',
    };
  }

  // ─── READ ALL ───────────────────────────────────────────────────────────
  async findAll() {
    const res = await this.prisma.item.findMany();

    if (res.length === 0) {
      throw new NotFoundException({ message: 'No se encontraron items', code: 1 });
    }

    return { res, code: 0, message: 'Items encontrados' };
  }

  // ─── READ ONE ───────────────────────────────────────────────────────────
  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      throw new NotFoundException({ message: 'Item no encontrado', code: 1 });
    }

    return { res: item, code: 0, message: 'Item encontrado' };
  }

  // ─── UPDATE ─────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateItemRequestDto) {
    const itemId = Number(id);

    // 1. Verificar existencia
    const existing = await this.prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!existing) {
      throw new NotFoundException({ message: 'Item no encontrado', code: 1 });
    }

    // 2. Construir objeto de datos condicionalmente
    const data: { codigo?: string; nombre?: string; descripcion?: string | null; activo?: boolean } = {};

    if (dto.codigo !== undefined) data.codigo = dto.codigo.trim().toUpperCase();
    if (dto.nombre !== undefined) data.nombre = dto.nombre.trim();
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion?.trim() ?? null;
    if (dto.activo !== undefined) data.activo = dto.activo;

    // 3. Si no hay cambios, retornar sin actualizar
    if (Object.keys(data).length === 0) {
      return { res: existing, code: 0, message: 'No hay cambios para actualizar' };
    }

    // 4. Verificar conflictos de unicidad (excluyendo el registro actual)
    if (data.codigo) {
      const duplicated = await this.prisma.item.findFirst({
        where: { codigo: data.codigo, NOT: { id: itemId } },
      });
      if (duplicated) {
        throw new ConflictException({ message: 'Ya existe un item con ese codigo', code: 1 });
      }
    }

    // 5. Actualizar y retornar
    const actualizado = await this.prisma.item.update({
      where: { id: itemId },
      data,
    });

    return { res: actualizado, code: 0, message: 'Item actualizado correctamente' };
  }
}
```

### Servicio Relacional (Llaves Foráneas)

Para módulos con relaciones, el servicio valida las entidades relacionadas:

```typescript
async create(dto: CreateUserProjectRequestDto) {
  // 1. Normalizar
  const userId = dto.userId;
  const projectId = dto.projectId;

  // 2. Validar que el usuario existe
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException({ message: 'Usuario no encontrado', code: 1 });

  // 3. Validar que el proyecto existe
  const project = await this.prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundException({ message: 'Proyecto no encontrado', code: 1 });

  // 4. Validar unicidad compuesta
  const existing = await this.prisma.userProject.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (existing) throw new ConflictException({ message: 'La asignación ya existe', code: 1 });

  // 5. Crear con datos relacionados (include)
  const nuevo = await this.prisma.userProject.create({
    data: { userId, projectId, activo: dto.activo ?? true },
    include: { user: true, project: true },   // Incluir relaciones en la respuesta
  });

  return { res: nuevo, code: 0, message: 'Asignación creada correctamente' };
}
```

### Manejo de Errores — Excepciones NestJS

```typescript
// 400 — Datos inválidos
throw new BadRequestException({ message: 'Datos inválidos', code: 1 });

// 401 — No autenticado
throw new UnauthorizedException({ message: 'Credenciales incorrectas', code: 1 });

// 403 — Sin permisos (lanzado automáticamente por PermissionGuard)
throw new ForbiddenException('Permisos insuficientes');

// 404 — No encontrado
throw new NotFoundException({ message: 'Registro no encontrado', code: 1 });

// 409 — Conflicto/Duplicado
throw new ConflictException({ message: 'El registro ya existe', code: 1 });
```

---

## 8. Sistema de Autenticación (JWT)

### Flujo de Autenticación

```
┌──────────┐     POST /api/auth/login      ┌──────────────┐
│  Cliente  │ ──────────────────────────▶   │  AuthService  │
│           │     { email, password }       │               │
│           │                               │  1. Buscar usuario por email
│           │                               │  2. Comparar hash bcrypt
│           │     { access_token,           │  3. Generar JWT (signToken)
│           │ ◀──  refresh_token,           │  4. Crear refresh token en DB
│           │      expires_in }             └──────────────┘
│           │
│           │     GET /api/cualquier-ruta    ┌──────────────┐
│           │ ──────────────────────────▶    │  JwtAuthGuard │
│           │     Authorization: Bearer X   │               │
│           │                               │  1. Verificar JWT válido
│           │                               │  2. JwtStrategy.validate()
│           │                               │  3. Cargar permisos efectivos
│           │                               │  4. Inyectar user en req.user
│           │                               └──────────────┘
└──────────┘
```

### JWT Payload (Interface)

```typescript
// src/auth/interfaces/jwt-payload.interface.ts

export interface JwtPayload {
  sub: number;              // userId
  email: string;
  permissions: string[];    // Permisos efectivos del usuario
  isSuperAdmin: boolean;    // Super admin con acceso total
}
```

### JWT Strategy (Validación en cada request)

```typescript
// src/auth/jwt.strategy.ts

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private permissionService: PermissionService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    // Flujo 1: Super Admin — bypass total
    if (payload.isSuperAdmin) {
      return { userId: payload.sub, isSuperAdmin: true, permissions: [] };
    }

    // Flujo 2: Usuario regular — cargar permisos actualizados
    const permissions = await this.permissionService.getUserEffectivePermissions(payload.sub);
    return { userId: payload.sub, email: payload.email, permissions };
  }
}
```

> **Importante:** Los permisos se cargan en **cada request** (no se cachean del JWT) para reflejar cambios en permisos en tiempo real.

### JwtAuthGuard (Bypass para rutas de Auth)

```typescript
// src/auth/guards/jwt-auth.guard.ts

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    // Las rutas de auth NO requieren JWT
    if (request?.path?.startsWith('/auth') || request?.path?.startsWith('/api/auth')) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### Token Refresh y Rotación

```
1. Cliente envía POST /api/auth/refresh con { refreshToken }
2. AuthService valida el refresh token (hash SHA-256 en DB)
3. Se revoca el refresh token anterior
4. Se generan nuevos access_token + refresh_token
5. Se retorna el par nuevo al cliente
```

### Variables de Entorno para Auth

| Variable | Default | Descripción |
|----------|---------|-------------|
| `JWT_SECRET` | — | Clave secreta para firmar JWTs |
| `JWT_EXPIRES_IN` | `1h` | Tiempo de vida del access token |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | `7` | Días de validez del refresh token |
| `PASSWORD_RESET_URL` | — | URL del frontend para resetear contraseña |
| `RESET_PASSWORD_TOKEN_EXPIRATION` | `1h` | TTL del token de reseteo |

---

## 9. Sistema de Permisos (RBAC)

### Formato de Permisos

Los permisos siguen el patrón `recurso:accion`:

```
users:create          # Crear usuarios
users:read            # Leer usuarios
users:update          # Actualizar usuarios
users:delete          # Eliminar usuarios
item:create           # Crear ítems
item:read             # Leer ítems
```

Regex de validación: `^[a-z-]+:[a-z-]+$`

### Decoradores Personalizados

Definidos en `src/auth/decorators/`:

```typescript
// 1. @Public() — Endpoint público, sin auth ni permisos
export const Public = () => SetMetadata('isPublic', true);

// 2. @RequirePermission(...permisos) — Requiere permisos específicos (lógica AND)
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// 3. @IsSuperAdmin() — Solo super administradores
export const IsSuperAdmin = () => SetMetadata('isSuperAdminRequired', true);
```

### Flujo del PermissionGuard

```typescript
// src/auth/guards/permission.guard.ts — Orden de evaluación:

1. ¿Tiene @Public()?           → ✅ Permitir acceso
2. ¿Tiene @RequirePermission?  → Si no hay permisos requeridos → ✅ Permitir
3. ¿Es SuperAdmin?             → ✅ Permitir acceso total
4. Comparar permisos            → Lógica AND: debe tener TODOS los requeridos
                                → Si falta alguno → ❌ 403 ForbiddenException
```

### Cálculo de Permisos Efectivos

```
Permisos efectivos = (Permisos de roles) + (Overrides concedidos al usuario) - (Overrides denegados al usuario)
```

El servicio `PermissionService.getUserEffectivePermissions(userId)` calcula esto combinando:
- Permisos de todos los roles asignados al usuario
- Overrides individuales (`UserPermission.granted = true` agrega, `granted = false` quita)

### Roles por Defecto (Seeds)

| Rol | Permisos |
|-----|----------|
| `admin` | Todos los permisos (acceso total) |
| `editor` | CRUD completo en todos los módulos de dominio |
| `viewer` | Solo lectura en todos los módulos |

---

## 10. Prisma ORM (Base de Datos)

### PrismaService

```typescript
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();       // Conectar al iniciar el módulo
  }
  async onModuleDestroy() {
    await this.$disconnect();    // Desconectar al destruir el módulo
  }
}
```

```typescript
// src/prisma/prisma.module.ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService],       // Disponible para todos los módulos que lo importen
})
export class PrismaModule {}
```

### Convenciones del Schema (`prisma/schema.prisma`)

#### Modelo Estándar

```prisma
model Item {
  id          Int       @id @default(autoincrement())    // PK auto-incrementable
  codigo      String    @unique                           // Clave de negocio única
  nombre      String
  descripcion String?   @db.Text                          // Campo largo opcional
  activo      Boolean   @default(true)                    // Soft delete
  createdAt   DateTime  @default(now())                   // Timestamp de creación
  updatedAt   DateTime  @updatedAt                        // Timestamp de actualización

  // Relaciones
  category    Category? @relation(fields: [categoryId], references: [id])
  categoryId  Int?

  // Índices
  @@index([activo])                                       // Índice para filtro frecuente
  @@index([categoryId])                                   // Índice en FK
}
```

#### Tabla de Unión (Many-to-Many)

```prisma
model UserProject {
  userId    Int
  projectId Int
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@id([userId, projectId])           // Clave primaria compuesta
  @@index([userId])                   // Índice en FK
  @@index([projectId])                // Índice en FK
}
```

#### Enums

```prisma
enum EntityStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### Convenciones de Prisma

| Convención | Ejemplo |
|------------|---------|
| PK autoincremental | `@id @default(autoincrement())` |
| Clave de negocio | `@unique` en `codigo`, `email` |
| Soft delete | `activo Boolean @default(true)` |
| Timestamps | `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt` |
| Índice en FK | `@@index([foreignKeyId])` |
| Cascade en join tables | `onDelete: Cascade` |
| Texto largo | `@db.Text` |
| Decimales | `@db.Decimal(10, 2)` para precios/montos |
| JSON | `Json` para configuraciones flexibles |

### Workflow de Migraciones

```bash
# 1. Formatear el schema
npx prisma format

# 2. Crear y aplicar migración
npx prisma migrate dev --name nombre_descriptivo

# 3. Regenerar el cliente
npx prisma generate

# 4. Seed de datos iniciales
npm run db:seed

# 5. Reset completo (dev only)
npm run db:reset    # Drop → Migrate → Seed
```

### Operaciones Prisma Comunes en Servicios

```typescript
// Buscar por campo único
await this.prisma.x.findUnique({ where: { id } });
await this.prisma.x.findUnique({ where: { codigo } });

// Buscar por clave compuesta
await this.prisma.x.findUnique({
  where: { userId_projectId: { userId, projectId } },
});

// Buscar todos con filtro
await this.prisma.x.findMany({ where: { activo: true } });

// Buscar con relaciones (include)
await this.prisma.x.findMany({
  where: { activo: true },
  include: { category: true, project: true },
});

// Verificar duplicados excluyendo registro actual
await this.prisma.x.findFirst({
  where: { codigo: nuevoCodigo, NOT: { id: currentId } },
});

// Crear
await this.prisma.x.create({ data: { ... } });

// Actualizar
await this.prisma.x.update({ where: { id }, data: { ... } });

// Soft delete (preferido sobre hard delete)
await this.prisma.x.update({ where: { id }, data: { activo: false } });

// Upsert (create o update)
await this.prisma.x.upsert({
  where: { codigo },
  create: { codigo, nombre },
  update: { nombre },
});
```

---

## 11. Servicios Externos (Mail y S3)

### Servicio de Mail (Nodemailer)

**Configuración:**

```typescript
// src/mail/mail.service.ts
@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    // Soporta Gmail (service mode) y SMTP genérico
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('MAIL_SERVICE'),   // 'gmail'
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMail(dto: SendMailRequestDto) {
    const info = await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: dto.to,
      subject: dto.subject,
      text: dto.text,
      html: dto.html,
    });

    return {
      res: { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected },
      code: 0,
      message: 'Correo enviado correctamente',
    };
  }
}
```

**Variables de entorno:**

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `MAIL_SERVICE` | `gmail` | Servicio de correo |
| `SMTP_USER` | `bot@gmail.com` | Usuario SMTP |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | Contraseña de aplicación |
| `MAIL_FROM` | `Soporte <bot@gmail.com>` | Remitente por defecto |

### Servicio de Assets (AWS S3)

**Configuración:**

```typescript
// src/assets/assets.service.ts
@Injectable()
export class AssetsService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File) {
    // Key format: uploads/{uuid}{extension}
    const key = `uploads/${uuid()}${extname(file.originalname)}`;

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const publicUrl = this.configService.get('AWS_S3_PUBLIC_URL');
    const url = publicUrl ? `${publicUrl}/${key}` : `https://${this.bucket}.s3.amazonaws.com/${key}`;

    return { res: { url, key }, code: 0, message: 'Archivo subido correctamente' };
  }
}
```

**Validaciones en el controlador:**
- Tamaño máximo: **5 MB**
- Tipos permitidos: `image/png`, `image/jpeg`, `image/gif`, `image/webp`

**Variables de entorno:**

| Variable | Descripción |
|----------|-------------|
| `AWS_REGION` | Región de AWS (ej: `us-east-1`) |
| `AWS_S3_BUCKET` | Nombre del bucket S3 |
| `AWS_ACCESS_KEY_ID` | Clave de acceso IAM |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta IAM |
| `AWS_S3_PUBLIC_URL` | URL pública de CloudFront (opcional) |

---

## 12. Testing

### Unit Tests (Jest)

**Configuración en `package.json`:**

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

**Comandos:**

```bash
npm run test             # Ejecutar tests unitarios
npm run test:watch       # Modo watch
npm run test:cov         # Con reporte de cobertura
npm run test:debug       # Con debugger
```

### E2E Tests (Supertest)

```typescript
// test/auth-login.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Login (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // IMPORTANTE: Replicar la misma configuración que main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
  });

  it('should login successfully', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' })
      .expect(201)
      .then((res) => {
        expect(res.body.access_token).toBeDefined();
        expect(res.body.refresh_token).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Comandos:**

```bash
npm run test:e2e         # Ejecutar tests e2e
```

### Usuarios de Prueba (Seeds)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin (SuperAdmin) | `admin@example.com` | `password123` |
| Editor | `editor@example.com` | `password123` |
| Viewer | `viewer@example.com` | `password123` |

---

## 13. DevOps y Calidad de Código

### Conventional Commits

Formato obligatorio: `tipo(scope): descripción`

```bash
# Tipos válidos
feat(item):      agregar endpoint de búsqueda avanzada
fix(auth):       corregir validación de token expirado
refactor(user):  extraer lógica de roles a helper
docs(readme):    actualizar instrucciones de setup
style(lint):     corregir formato de archivos
test(auth):      agregar tests de login
chore(deps):     actualizar dependencias
perf(queries):   optimizar consultas N+1
ci(docker):      actualizar Dockerfile
```

### Docker

#### Dockerfile (Single-stage Build)

```dockerfile
FROM node:20-alpine
WORKDIR /app

# 1. Copiar package.json y prisma primero (aprovecha cache de layers)
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# 2. Copiar config de TypeScript y codigo fuente
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# 3. Generar cliente Prisma y compilar NestJS
RUN npx prisma generate
RUN npx nest build

EXPOSE 3000
CMD ["node", "dist/src/main"]
```

> **Nota sobre la ruta `dist/src/main`:** NestJS compila con `outDir: ./dist` y `sourceRoot: src` (nest-cli.json), lo que genera la salida en `dist/src/`. Por eso el entry point es `dist/src/main`, no `dist/main`.

#### Docker Compose (Backend + PostgreSQL)

El archivo `docker-compose.yml` del backend levanta PostgreSQL y el backend juntos. Util para testing local del container sin el frontend.

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U myuser -d mydb']
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    ports:
      - '3000:3000'
    command: sh -c "npx prisma migrate deploy && node dist/src/main"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://myuser:mypassword@postgres:5432/mydb?schema=public
      JWT_SECRET: super_secret_key
      JWT_EXPIRES_IN: 1h
      REFRESH_TOKEN_EXPIRES_IN_DAYS: 7
      PORT: 3000

volumes:
  postgres_data:
```

> **Nota:** El comando del backend ejecuta `prisma migrate deploy` antes de iniciar la app para aplicar migraciones automáticamente. La ruta `dist/src/main` corresponde a la salida de `npx nest build`.

> **Para deployment completo (backend + frontend + PostgreSQL):** Usar el `docker-compose.yml` de la raiz del monorepo. Ver [GUIA-MONOREPO.md](../GUIA-MONOREPO.md) seccion 7.3.

#### Docker Compose para Desarrollo Local

El archivo `docker-compose.dev.yml` levanta **solo PostgreSQL** para desarrollo local. La app NestJS se ejecuta en la máquina del desarrollador con `npm run start:dev` (hot-reload).

```yaml
services:
  postgres-dev:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - '5432:5432'
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U myuser -d mydb']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_dev_data:
```

**Scripts de conveniencia en `package.json`:**

| Script | Comando | Descripción |
|--------|---------|-------------|
| `npm run docker:dev:up` | `docker compose -f docker-compose.dev.yml up -d` | Levantar la BD en segundo plano |
| `npm run docker:dev:down` | `docker compose -f docker-compose.dev.yml down` | Detener la BD |
| `npm run docker:dev:reset` | `docker compose -f docker-compose.dev.yml down -v` | Detener la BD y borrar datos |

**Flujo de desarrollo:**

```bash
npm run docker:dev:up      # 1. Levantar PostgreSQL
npm run db:migrate          # 2. Aplicar migraciones
npm run db:seed             # 3. Poblar datos iniciales
npm run start:dev           # 4. Iniciar NestJS con hot-reload
```

> **Nota:** El `DATABASE_URL` del `.env` apunta a `localhost:5432`, compatible con `docker-compose.dev.yml`. El volumen `postgres_dev_data` es independiente de `postgres_data` (producción) para evitar conflictos si ambos corren en la misma máquina.

### Variables de Entorno Completas

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | Sí | — | Connection string de PostgreSQL |
| `PORT` | No | `3000` | Puerto del servidor |
| `JWT_SECRET` | Sí | — | Clave secreta para firmar JWTs |
| `JWT_EXPIRES_IN` | No | `1h` | TTL del access token |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | No | `7` | Días de validez del refresh token |
| `MAIL_SERVICE` | Sí | — | Servicio de correo (`gmail`) |
| `SMTP_USER` | Sí | — | Usuario SMTP |
| `SMTP_PASS` | Sí | — | Contraseña SMTP |
| `MAIL_FROM` | Sí | — | Remitente de emails |
| `PASSWORD_RESET_URL` | Sí | — | URL del frontend para reset |
| `RESET_PASSWORD_TOKEN_EXPIRATION` | No | `1h` | TTL del token de reseteo |
| `AWS_REGION` | Sí* | — | Región de AWS |
| `AWS_S3_BUCKET` | Sí* | — | Nombre del bucket |
| `AWS_ACCESS_KEY_ID` | Sí* | — | Access Key de IAM |
| `AWS_SECRET_ACCESS_KEY` | Sí* | — | Secret Key de IAM |
| `AWS_S3_PUBLIC_URL` | No | — | URL de CloudFront |

> *Requeridas solo si se usa el módulo de Assets/S3.

---

## 14. Convenciones de Nomenclatura

### Resumen General

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Ruta de controlador | `kebab-case` | `@Controller('item')` |
| Tag de Swagger | `kebab-case` | `@ApiTags('item')` |
| Permiso | `recurso:accion` | `'item:create'`, `'users:read'` |
| DTO de request | `*.req.dto.ts` | `item.req.dto.ts` |
| DTO de response | `*.res.dto.ts` | `item.res.dto.ts` |
| Clase DTO request | `PascalCase + RequestDto` | `CreateItemRequestDto` |
| Clase DTO response | `PascalCase + ResponseDto` | `GetAllItemResponseDto` |
| Archivo de servicio | `*.service.ts` | `item.service.ts` |
| Archivo de controlador | `*.controller.ts` | `item.controller.ts` |
| Archivo de módulo | `*.module.ts` | `item.module.ts` |
| Migración Prisma | `snake_case` descriptivo | `add_item_model` |

### Normalización de Strings

| Dato | Normalización | Ejemplo |
|------|---------------|---------|
| Códigos (business keys) | `.trim().toUpperCase()` | `" cat01 "` → `"CAT01"` |
| Nombres | `.trim()` | `" Álgebra "` → `"Álgebra"` |
| Emails | `.trim().toLowerCase()` | `" Admin@Example.com "` → `"admin@example.com"` |
| Descripciones | `?.trim()` (null-safe) | `" Desc "` → `"Desc"` / `null` → `null` |

### Importaciones Estándar

```typescript
// NestJS Core
import { Injectable, Controller, Get, Post, Body, Param, UseGuards,
         NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

// Swagger
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBearerAuth,
         ApiBody, ApiConsumes } from '@nestjs/swagger';

// Validación
import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString,
         IsEmail, MinLength, MaxLength, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// Prisma
import { PrismaService } from 'src/prisma/prisma.service';

// Auth
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators';
```

---

## Checklist para Crear un Nuevo Módulo

1. [ ] Crear estructura de carpetas: `modulo/`, `modulo/dto/`
2. [ ] Crear `modulo.req.dto.ts` con validaciones `class-validator`
3. [ ] Crear `modulo.res.dto.ts` con estructura `{ res, code, message }` y lazy resolvers
4. [ ] Crear `modulo.service.ts` con normalización, validación de unicidad y manejo de errores
5. [ ] Crear `modulo.controller.ts` con decoradores Swagger completos y permisos
6. [ ] Crear `modulo.module.ts` importando `PrismaModule`
7. [ ] Agregar modelo en `prisma/schema.prisma` con timestamps y soft delete
8. [ ] Ejecutar `npx prisma format` → `npx prisma migrate dev --name nombre`
9. [ ] Registrar módulo en `app.module.ts` o en el módulo agregador correspondiente
10. [ ] Agregar permisos en `prisma/seed.ts` (formato `modulo:accion`)
11. [ ] Asignar permisos a roles existentes en el seed
12. [ ] Ejecutar `npm run db:seed` para aplicar los permisos

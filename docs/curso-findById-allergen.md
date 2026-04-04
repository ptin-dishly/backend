# Curso: Crea tu primer endpoint GET por ID

> Para un desarrollador inteligente que todavia no ha tocado backend.
> Idioma del curso: castellano. Idioma del codigo: ingles.

---

## PARTE 1 — Entendiendo como funciona esto (teoria con codigo real)

Antes de escribir ni una linea, vamos a recorrer **el camino que hace una peticion HTTP** desde que llega al servidor hasta que devuelve datos. Usaremos como ejemplo el endpoint **GET /api/v1/allergens** (listar todos los alergenos), que ya existe y funciona.

---

### 1.1 La arquitectura en 30 segundos

Imagina que el backend es un restaurante:

```
Cliente (navegador/Postman)
    |
    v
[Ruta]         → El maitre: decide a que mesa (funcion) te manda
    |
    v
[Controller]   → El camarero: recoge el pedido y lo lleva a cocina
    |
    v
[Service]      → El chef: aplica las reglas de negocio (validaciones)
    |
    v
[Repository]   → El almacen: habla con la base de datos
    |
    v
[Base de datos] → PostgreSQL con la tabla "allergens"
```

Cada capa tiene **una sola responsabilidad**. Esto se llama **arquitectura hexagonal** (o de puertos y adaptadores), pero no te preocupes por el nombre. Lo importante es: cada pieza hace una cosa, y se comunican a traves de interfaces.

---

### 1.2 El viaje de GET /api/v1/allergens paso a paso

Vamos a seguir el recorrido fichero a fichero, como si fueramos la peticion HTTP.

---

#### Paso 1: La peticion llega al servidor Express

**Fichero: `src/infrastructure/drivers/http/app.ts`** (lineas 126-129)

```typescript
const v1 = express.Router();
v1.use(allergenRoutes(container.allergenService));

app.use("/api/v1", v1);
```

**Que hace esto:**
- Express es el framework web (piensa en el como el "esqueleto" del servidor).
- `app.use("/api/v1", v1)` dice: "todo lo que empiece por `/api/v1`, pasalo al router `v1`".
- Dentro de `v1`, enganchamos las rutas de alergenos.

**Que es `container.allergenService`?**
Es la instancia ya creada del servicio. Mira `src/infrastructure/bootstrap/container.ts`:

```typescript
export function createContainer(): Container {
  const allergenRepository = new PgAllergenRepository(pool);  // Crea el almacen (repo)
  const allergenService = new AllergenService(allergenRepository); // Crea el chef (servicio)

  return { pool, allergenService };
}
```

Aqui se **inyectan las dependencias**: el servicio recibe el repositorio, y el repositorio recibe la conexion a la base de datos (`pool`). Esto permite que en los tests puedas pasar un repositorio falso (mock) en lugar del real.

---

#### Paso 2: El Router decide quien atiende

**Fichero: `src/infrastructure/drivers/http/routes/allergenRoutes.ts`**

```typescript
export function allergenRoutes(allergenService: AllergenService): Router {
  const router = Router();
  const controller = createAllergenController(allergenService);

  router.get("/allergens", controller.findAll);                                    // GET listar
  router.post("/allergens", validate({ body: CreateAllergenSchema }), controller.create);  // POST crear
  router.delete("/allergens/:id", validate({ params: AllergenParamsSchema }), controller.remove); // DELETE borrar

  return router;
}
```

**Que hace esto:**
- Cada linea `router.get(...)`, `router.post(...)`, `router.delete(...)` es como una regla: "si llega un GET a /allergens, ejecuta `controller.findAll`".
- Fijate en el `delete`: tiene `validate({ params: AllergenParamsSchema })` **antes** del controller. Esto es un **middleware** — una funcion que se ejecuta en medio, antes de que llegue al controller. Si la validacion falla, la peticion nunca llega al controller.

**Que es `AllergenParamsSchema`?** Lo veremos en un momento. Pero basicamente dice: "el `:id` de la URL tiene que ser un UUID valido".

---

#### Paso 3: El Middleware de validacion (el portero)

**Fichero: `src/infrastructure/drivers/http/middleware/validate.ts`**

```typescript
export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return sendBadRequest(res, "Invalid path parameters", {
          errors: result.error.flatten().fieldErrors,
        });
      }
    }
    // ... lo mismo para query y body ...
    next();  // Si todo OK, deja pasar al siguiente (el controller)
  };
}
```

**Que hace esto:**
- Recibe "schemas" (definiciones de como deben ser los datos).
- Usa **Zod** (una libreria de validacion) para comprobar que los datos son correctos.
- Si algo falla → responde 400 (Bad Request) y **no deja pasar** al controller.
- Si todo OK → llama a `next()` que pasa al siguiente en la cadena.

**Los schemas de validacion estan en: `src/infrastructure/drivers/http/schemas/allergen.ts`**

```typescript
export const AllergenParamsSchema = z.object({
  id: z.string().uuid(),   // "id" debe ser un string con formato UUID
});
```

Esto es lo que usa el `delete` para validar que el `:id` de la URL es un UUID real, no cualquier texto basura.

---

#### Paso 4: El Controller (el camarero)

**Fichero: `src/infrastructure/drivers/http/controllers/allergenController.ts`**

```typescript
export function createAllergenController(allergenService: AllergenService) {
  return {
    async findAll(_req: Request, res: Response) {
      const result = await allergenService.findAll();

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },

    async remove(req: Request<{ id: string }>, res: Response) {
      const result = await allergenService.delete(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "Allergen deleted");
    },
  };
}
```

**Que hace el controller:**
1. Llama al servicio con los datos de la peticion.
2. Mira si el resultado es `ok` o no.
3. Si es ok → responde con exito (`sendSuccess`).
4. Si no es ok → responde con error (`sendErrorByCode`).

**El controller NO tiene logica de negocio.** No valida datos, no decide si algo existe o no. Solo es un traductor entre HTTP y el servicio.

**Nota sobre `Request<{ id: string }>`:** Esto le dice a TypeScript que `req.params` tiene una propiedad `id` de tipo string. Es solo para que el editor te ayude con autocompletado.

---

#### Paso 5: El Service (el chef)

**Fichero: `src/domain/services/AllergenService.ts`**

```typescript
export class AllergenService {
  constructor(private allergenRepository: AllergenRepository) {}

  async findAll(): Promise<Result<Allergen[]>> {
    return await this.allergenRepository.findAll();
  }

  async delete(id: string): Promise<Result<void>> {
    if (!id) {
      return fail("INVALID_ID", "Allergen ID is required");
    }
    return await this.allergenRepository.delete(id);
  }
}
```

**Que hace el servicio:**
- `findAll()`: Simplemente delega al repositorio. No necesita validar nada.
- `delete(id)`: **Primero valida** que el `id` no este vacio, y luego delega.

**Que es `Result<T>`?** Es el patron que usa este proyecto para manejar errores sin excepciones:

```typescript
// src/domain/value-objects/Result.ts
type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = (code, message, cause?): Result<never> => ({ ok: false, error: { code, message, cause } });
```

Es como un sobre: o contiene el resultado exitoso (`ok: true, value: ...`) o contiene el error (`ok: false, error: ...`). **Nunca lanza excepciones**, siempre retorna un `Result`.

**Que es la interfaz `AllergenRepository`?** Es el "contrato" (port/puerto):

```typescript
// src/domain/ports/drivens/AllergenRepository.ts
export interface AllergenRepository {
  create(data: CreateAllergenData): Promise<Result<Allergen>>;
  findAll(): Promise<Result<Allergen[]>>;
  delete(id: string): Promise<Result<void>>;
}
```

El servicio **no sabe** si el repositorio habla con PostgreSQL, MongoDB o un fichero JSON. Solo sabe que tiene estos metodos. Esto es el concepto de **inversion de dependencias**: el dominio define que necesita, y la infraestructura lo implementa.

---

#### Paso 6: El Repository (el almacen)

**Fichero: `src/infrastructure/drivens/persistence/pg/PgAllergenRepository.ts`**

```typescript
export class PgAllergenRepository implements AllergenRepository {
  constructor(private pool: pg.Pool) {}

  async findAll(): Promise<Result<Allergen[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM allergens ORDER BY eu_number ASC");
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve allergens", error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this.pool.query("DELETE FROM allergens WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", "Allergen not found");
      }

      return ok(undefined);
    } catch (error: unknown) {
      return fail("DELETE_ERROR", "Failed to delete allergen", error);
    }
  }

  private toEntity(row: Record<string, unknown>): Allergen {
    return new Allergen(
      row.id as string,
      row.code as string,
      row.name_es as string,
      row.name_ca as string,
      row.name_en as string,
      row.icon_url as string | null,
      row.description as string | null,
      row.eu_number as number,
      row.created_at as Date,
    );
  }
}
```

**Que hace el repositorio:**
- `this.pool.query(...)` ejecuta SQL contra PostgreSQL.
- `$1` es un **parametro seguro** (evita inyeccion SQL — nunca concatenes strings en SQL).
- `toEntity(row)` convierte la fila de la base de datos (con `name_es`, `name_ca`, etc.) en un objeto `Allergen` de nuestro dominio (con `nameEs`, `nameCa`, etc.). La base de datos usa snake_case, nuestro codigo usa camelCase.
- Si hay error → lo captura con `try/catch` y devuelve un `fail(...)`.
- En el `delete`: si `rowCount === 0` significa que no encontro nada que borrar → `NOT_FOUND`.

---

#### Paso 7: La Entidad (el plato)

**Fichero: `src/domain/entities/Allergen.ts`**

```typescript
export class Allergen {
  constructor(
    readonly id: string,
    readonly code: string,
    readonly nameEs: string,
    readonly nameCa: string,
    readonly nameEn: string,
    readonly iconUrl: string | null,
    readonly description: string | null,
    readonly euNumber: number,
    readonly createdAt: Date,
  ) {}
}
```

Es simplemente la "forma" de un alergeno en nuestro sistema. `readonly` significa que no se puede modificar despues de crearlo.

---

#### Paso 8: Las respuestas HTTP (el formato del plato)

**Fichero: `src/infrastructure/drivers/http/responses/helpers.ts`**

```typescript
export function sendSuccess<T>(res: Response, statusCode: number, data: T, message?: string): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
    meta: createMeta(),
  });
}

export function sendErrorByCode(res: Response, errorCode: ErrorCode, message: string): void {
  sendError(res, getHttpStatusFromErrorCode(errorCode), errorCode, message);
}
```

Todas las respuestas del API siguen este formato estandar:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-04-04T..." }
}
```

Y `sendErrorByCode` traduce automaticamente los codigos de error del dominio (como `NOT_FOUND`, `INVALID_ID`) a codigos HTTP (404, 400, etc.).

---

#### Paso 9: La documentacion OpenAPI (Scalar)

**Fichero: `src/infrastructure/drivers/http/docs/registry.ts`**

Aqui se registran los endpoints para que aparezcan en la documentacion interactiva en `/docs`. Cada endpoint se describe con:
- Metodo y path
- Parametros de entrada
- Posibles respuestas (con ejemplos)

---

#### Paso 10: Los Tests

**Fichero: `tests/domain/services/AllergenService.test.ts`**

Los tests usan **Vitest** y prueban el servicio **sin base de datos real**. Crean un repositorio "falso" (mock):

```typescript
function createMockRepo(overrides?: Partial<AllergenRepository>): AllergenRepository {
  return {
    create: async (data) => ok(fakeAllergen(data)),
    findAll: async () => ok([]),
    delete: async () => ok(undefined),
    ...overrides,
  };
}
```

Esto permite probar que el servicio hace bien su trabajo sin depender de PostgreSQL.

---

### 1.3 Resumen visual del flujo

```
GET /api/v1/allergens/abc-123
       |
       v
  allergenRoutes.ts         →  "GET /allergens/:id" coincide
       |
       v
  validate.ts               →  Comprueba que "abc-123" sea UUID valido
       |
       v
  allergenController.ts     →  Llama a service.findById("abc-123")
       |
       v
  AllergenService.ts        →  Valida que id no este vacio, llama a repo
       |
       v
  PgAllergenRepository.ts   →  SELECT * FROM allergens WHERE id = $1
       |
       v
  Allergen.ts               →  Convierte fila de DB en entidad
       |
       v
  allergenController.ts     →  Responde 200 con datos o 404 si no existe
```

---

---

## PARTE 2 — Manos a la obra: Implementar GET /allergens/:id

Ahora que entiendes como funciona todo, vamos a implementar tu endpoint **paso a paso**. Cada paso tiene: que hacer, donde hacerlo, el codigo exacto, y por que.

---

### Paso 0: Crear la rama

Antes de tocar nada, crea una rama desde `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b feature/get-allergen-by-id
```

**Por que:**
- Siempre trabajamos en ramas separadas, nunca directamente en `dev`.
- El nombre sigue la convencion del proyecto: `feature/nombre-descriptivo`.
- `git pull` asegura que tienes los ultimos cambios.

---

### Paso 1: Anadir `findById` a la interfaz del repositorio

**Fichero: `src/domain/ports/drivens/AllergenRepository.ts`**

**Antes:**
```typescript
export interface AllergenRepository {
  create(data: CreateAllergenData): Promise<Result<Allergen>>;
  findAll(): Promise<Result<Allergen[]>>;
  delete(id: string): Promise<Result<void>>;
}
```

**Despues:**
```typescript
export interface AllergenRepository {
  create(data: CreateAllergenData): Promise<Result<Allergen>>;
  findAll(): Promise<Result<Allergen[]>>;
  findById(id: string): Promise<Result<Allergen | null>>;
  delete(id: string): Promise<Result<void>>;
}
```

**Por que:**
- La interfaz es el "contrato". Todos los repositorios (el real de PostgreSQL y los mocks de los tests) deben cumplir este contrato.
- `Allergen | null` porque puede que no exista un alergeno con ese ID, y eso **no es un error** (es un caso esperado). El repositorio devuelve `null`, y sera el **servicio** quien decida que hacer con eso.
- Lo ponemos antes de `delete` por orden logico (las operaciones de lectura antes que las de escritura/borrado).

---

### Paso 2: Implementar `findById` en el servicio

**Fichero: `src/domain/services/AllergenService.ts`**

Anade este metodo **entre `findAll` y `delete`**:

```typescript
async findById(id: string): Promise<Result<Allergen | null>> {
  if (!id) {
    return fail("INVALID_ID", "Allergen ID is required");
  }

  return await this.allergenRepository.findById(id);
}
```

El fichero completo quedara asi:

```typescript
import type { Allergen } from "@domain/entities/Allergen";
import type {
  AllergenRepository,
  CreateAllergenData,
} from "@domain/ports/drivens/AllergenRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail } from "@domain/value-objects/Result";

export class AllergenService {
  constructor(private allergenRepository: AllergenRepository) {}

  async create(data: CreateAllergenData): Promise<Result<Allergen>> {
    if (!data.code || data.code.length > 10) {
      return fail("VALIDATION_ERROR", "Code is required and must be at most 10 characters");
    }

    if (!data.nameEs || !data.nameCa || !data.nameEn) {
      return fail("VALIDATION_ERROR", "All language names (es, ca, en) are required");
    }

    if (data.euNumber < 1 || data.euNumber > 14) {
      return fail("VALIDATION_ERROR", "EU number must be between 1 and 14");
    }

    return await this.allergenRepository.create(data);
  }

  async findAll(): Promise<Result<Allergen[]>> {
    return await this.allergenRepository.findAll();
  }

  async findById(id: string): Promise<Result<Allergen | null>> {
    if (!id) {
      return fail("INVALID_ID", "Allergen ID is required");
    }

    return await this.allergenRepository.findById(id);
  }

  async delete(id: string): Promise<Result<void>> {
    if (!id) {
      return fail("INVALID_ID", "Allergen ID is required");
    }

    return await this.allergenRepository.delete(id);
  }
}
```

**Por que:**
- El patron es identico al `delete`: primero valida, luego delega.
- `if (!id)` atrapa tanto `""` (vacio) como `undefined` o `null`.
- El servicio **no sabe de HTTP**. No sabe que es un 400 o un 404. Solo dice "INVALID_ID" y el controller se encargara de traducirlo.

---

### Paso 3: Implementar `findById` en el repositorio de PostgreSQL

**Fichero: `src/infrastructure/drivens/persistence/pg/PgAllergenRepository.ts`**

Anade este metodo **entre `delete` y `findAll`** (o donde prefieras, pero mantener orden logico):

```typescript
async findById(id: string): Promise<Result<Allergen | null>> {
  try {
    const result = await this.pool.query("SELECT * FROM allergens WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return ok(null);
    }

    return ok(this.toEntity(result.rows[0]));
  } catch (error: unknown) {
    return fail("RETRIEVE_ERROR", "Failed to retrieve allergen", error);
  }
}
```

El fichero completo quedara asi:

```typescript
import { Allergen } from "@domain/entities/Allergen";
import type {
  AllergenRepository,
  CreateAllergenData,
} from "@domain/ports/drivens/AllergenRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgAllergenRepository implements AllergenRepository {
  constructor(private pool: pg.Pool) {}

  async create(data: CreateAllergenData): Promise<Result<Allergen>> {
    try {
      const result = await this.pool.query(
        `INSERT INTO allergens (code, name_es, name_ca, name_en, icon_url, description, eu_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.code,
          data.nameEs,
          data.nameCa,
          data.nameEn,
          data.iconUrl ?? null,
          data.description ?? null,
          data.euNumber,
        ],
      );

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "23505"
      ) {
        return fail("DUPLICATE_RESOURCE", "Allergen with this code or EU number already exists");
      }
      return fail("CREATE_ERROR", "Failed to create allergen", error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this.pool.query("DELETE FROM allergens WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return fail("NOT_FOUND", "Allergen not found");
      }

      return ok(undefined);
    } catch (error: unknown) {
      return fail("DELETE_ERROR", "Failed to delete allergen", error);
    }
  }

  async findAll(): Promise<Result<Allergen[]>> {
    try {
      const result = await this.pool.query("SELECT * FROM allergens ORDER BY eu_number ASC");
      return ok(result.rows.map((row) => this.toEntity(row)));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve allergens", error);
    }
  }

  async findById(id: string): Promise<Result<Allergen | null>> {
    try {
      const result = await this.pool.query("SELECT * FROM allergens WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return ok(null);
      }

      return ok(this.toEntity(result.rows[0]));
    } catch (error: unknown) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve allergen", error);
    }
  }

  private toEntity(row: Record<string, unknown>): Allergen {
    return new Allergen(
      row.id as string,
      row.code as string,
      row.name_es as string,
      row.name_ca as string,
      row.name_en as string,
      row.icon_url as string | null,
      row.description as string | null,
      row.eu_number as number,
      row.created_at as Date,
    );
  }
}
```

**Por que:**
- `$1` es un parametro preparado (seguro contra inyeccion SQL).
- Si `result.rows.length === 0` → no hay alergeno con ese ID → devolvemos `ok(null)`, **no** un error. El repositorio solo dice "no hay datos", el servicio decide que significa eso.
- Reutilizamos `this.toEntity()` que ya existia — no duplicamos codigo.
- El `try/catch` captura errores de la base de datos (conexion caida, etc.).

**Diferencia clave con el `delete`:** Fijate que el `delete` devuelve `fail("NOT_FOUND", ...)` cuando no encuentra nada, mientras que aqui devolvemos `ok(null)`. Esto es porque en el delete, si no hay nada que borrar, es un error real. Pero en el findById, "no encontrar" es un resultado valido que el controller interpretara como 404.

---

### Paso 4: Anadir el handler `findById` al controller

**Fichero: `src/infrastructure/drivers/http/controllers/allergenController.ts`**

Anade el metodo `findById` entre `findAll` y `remove`:

```typescript
async findById(req: Request<{ id: string }>, res: Response) {
  const result = await allergenService.findById(req.params.id);

  if (!result.ok) {
    return sendErrorByCode(res, result.error.code, result.error.message);
  }

  if (result.value === null) {
    return sendErrorByCode(res, "NOT_FOUND", "Allergen not found");
  }

  return sendSuccess(res, 200, result.value);
},
```

El fichero completo quedara asi:

```typescript
import type { AllergenService } from "@domain/services/AllergenService";
import { sendErrorByCode, sendSuccess } from "@infrastructure/drivers/http/responses";
import type { CreateAllergenBody } from "@infrastructure/drivers/http/schemas/allergen";
import type { Request, Response } from "express";

export function createAllergenController(allergenService: AllergenService) {
  return {
    async findAll(_req: Request, res: Response) {
      const result = await allergenService.findAll();

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, result.value);
    },

    async findById(req: Request<{ id: string }>, res: Response) {
      const result = await allergenService.findById(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      if (result.value === null) {
        return sendErrorByCode(res, "NOT_FOUND", "Allergen not found");
      }

      return sendSuccess(res, 200, result.value);
    },

    async remove(req: Request<{ id: string }>, res: Response) {
      const result = await allergenService.delete(req.params.id);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 200, null, "Allergen deleted");
    },

    async create(req: Request<unknown, unknown, CreateAllergenBody>, res: Response) {
      const result = await allergenService.create(req.body);

      if (!result.ok) {
        return sendErrorByCode(res, result.error.code, result.error.message);
      }

      return sendSuccess(res, 201, result.value);
    },
  };
}
```

**Por que:**
- `req.params.id` extrae el `:id` de la URL (por ejemplo, de `/allergens/abc-123` saca `"abc-123"`).
- Primero comprueba si el servicio devolvio error (como `INVALID_ID`).
- Luego comprueba si el valor es `null` (no encontrado) → responde 404.
- Si todo OK → responde 200 con el alergeno.
- `sendErrorByCode` traduce automaticamente `"NOT_FOUND"` a HTTP 404.

---

### Paso 5: Registrar la ruta

**Fichero: `src/infrastructure/drivers/http/routes/allergenRoutes.ts`**

Anade la ruta GET con el id **entre** el GET de listar y el POST:

```typescript
router.get("/allergens/:id", validate({ params: AllergenParamsSchema }), controller.findById);
```

El fichero completo quedara asi:

```typescript
import type { AllergenService } from "@domain/services/AllergenService";
import { createAllergenController } from "@infrastructure/drivers/http/controllers/allergenController";
import { validate } from "@infrastructure/drivers/http/middleware/validate";
import {
  AllergenParamsSchema,
  CreateAllergenSchema,
} from "@infrastructure/drivers/http/schemas/allergen";
import { Router } from "express";

export function allergenRoutes(allergenService: AllergenService): Router {
  const router = Router();
  const controller = createAllergenController(allergenService);

  router.get("/allergens", controller.findAll);
  router.get("/allergens/:id", validate({ params: AllergenParamsSchema }), controller.findById);
  router.post("/allergens", validate({ body: CreateAllergenSchema }), controller.create);
  router.delete("/allergens/:id", validate({ params: AllergenParamsSchema }), controller.remove);

  return router;
}
```

**Por que:**
- `:id` es un parametro dinamico de Express. Lo que venga en esa posicion de la URL estara en `req.params.id`.
- Reutilizamos `AllergenParamsSchema` que ya existe (lo usa el delete) — valida que el id sea UUID.
- **IMPORTANTE**: La ruta `/allergens/:id` va **despues** de `/allergens` sin parametro. Si la pusieras antes, Express podria confundirse y tratar la palabra "allergens" como un id. (En este caso no pasaria porque son metodos diferentes, pero es buena practica mantener el orden: rutas fijas primero, rutas con parametros despues.)

---

### Paso 6: Documentar en Scalar (OpenAPI)

**Fichero: `src/infrastructure/drivers/http/docs/registry.ts`**

Anade este bloque **despues** del `registerPath` del delete y **antes** del `registerPath` del `get /allergens` (listar). El orden no importa tecnicamente, pero queda mas limpio agrupar los GET juntos:

```typescript
registry.registerPath({
  method: "get",
  path: "/allergens/{id}",
  tags: ["Allergens"],
  summary: "Get an allergen by ID",
  description: "Returns a single allergen by its UUID",
  operationId: "getAllergenById",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Allergen found",
      content: {
        "application/json": {
          schema: SuccessResponseSchema(AllergenSchema),
          example: {
            success: true,
            data: allergenExamples.gluten,
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    400: {
      description: "Invalid ID format",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: {
            success: false,
            error: { code: "INVALID_REQUEST", message: "Invalid path parameters" },
            meta: { timestamp: "2026-04-03T10:00:00.000Z" },
          },
        },
      },
    },
    404: {
      description: "Allergen not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
          example: errorExamples.notFound,
        },
      },
    },
  },
});
```

**Por que:**
- Esto genera la documentacion automatica que aparece en `/docs`.
- `{id}` es la notacion OpenAPI para parametros de ruta (diferente de Express que usa `:id`).
- Documentamos las 3 respuestas posibles: 200 (encontrado), 400 (UUID invalido), 404 (no existe).
- Reutilizamos `allergenExamples.gluten` y `errorExamples.notFound` que ya estan definidos arriba en el fichero.

---

### Paso 7: Tests unitarios del servicio

**Fichero: `tests/domain/services/AllergenService.test.ts`**

Primero, hay que actualizar el mock para que incluya `findById`. Busca la funcion `createMockRepo` y anadele `findById`:

```typescript
function createMockRepo(overrides?: Partial<AllergenRepository>): AllergenRepository {
  return {
    create: async (data) => ok(fakeAllergen(data)),
    findAll: async () => ok([]),
    findById: async () => ok(null),
    delete: async () => ok(undefined),
    ...overrides,
  };
}
```

Luego, anade el bloque `describe("findById", ...)` **despues** del bloque `describe("findAll", ...)` y **antes** de `describe("delete", ...)`:

```typescript
describe("findById", () => {
  it("should return an allergen when found", async () => {
    const allergen = fakeAllergen(validData());
    repo = createMockRepo({ findById: async () => ok(allergen) });
    service = new AllergenService(repo);

    const result = await service.findById("some-uuid");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value?.code).toBe("GLU");
    }
  });

  it("should fail when id is empty", async () => {
    const result = await service.findById("");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_ID");
    }
  });

  it("should return null when allergen not found", async () => {
    const result = await service.findById("nonexistent-uuid");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeNull();
    }
  });

  it("should propagate repository errors", async () => {
    repo = createMockRepo({
      findById: async () => ({
        ok: false,
        error: { code: "RETRIEVE_ERROR", message: "Database connection failed" },
      }),
    });
    service = new AllergenService(repo);

    const result = await service.findById("some-uuid");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("RETRIEVE_ERROR");
    }
  });
});
```

**Por que estos 4 tests:**

1. **Caso OK** — el alergeno existe → el servicio devuelve el alergeno.
2. **ID vacio** — alguien pasa `""` → el servicio dice `INVALID_ID` sin llegar al repo.
3. **No encontrado** — el repo devuelve `null` → el servicio pasa ese `null` al controller (que lo convertira en 404).
4. **Error de repo** — la base de datos falla → el servicio propaga el error sin tragarselo.

Estos cubren exactamente lo que pide la tarea.

---

### Paso 8: Verificar que todo funciona

Ejecuta estos comandos en orden:

```bash
# 1. Que TypeScript no se queje (tipos correctos)
pnpm typecheck

# 2. Que el linter no se queje (formato de codigo)
pnpm lint:fix

# 3. Que los tests pasen
pnpm test
```

**Si `typecheck` falla:** probablemente olvidaste anadir `findById` en alguno de los sitios (interfaz, servicio, o repositorio). TypeScript te dira exactamente donde falta.

**Si los tests fallan:** lee el error. Normalmente dice que linea fallo y que esperaba vs que recibio.

**Si el linter se queja:** `pnpm lint:fix` arregla la mayoria de problemas automaticamente (orden de imports, punto y coma, etc.).

---

### Paso 9: Commit y push

```bash
# Anade los ficheros que cambiaste
git add src/domain/ports/drivens/AllergenRepository.ts
git add src/domain/services/AllergenService.ts
git add src/infrastructure/drivens/persistence/pg/PgAllergenRepository.ts
git add src/infrastructure/drivers/http/controllers/allergenController.ts
git add src/infrastructure/drivers/http/routes/allergenRoutes.ts
git add src/infrastructure/drivers/http/docs/registry.ts
git add tests/domain/services/AllergenService.test.ts

# Commit con mensaje descriptivo en ingles
git commit -m "feat(allergens): add GET /allergens/:id endpoint"

# Sube la rama
git push -u origin feature/get-allergen-by-id
```

**Por que `git add` fichero por fichero** y no `git add .`:
- Evitas subir cosas que no quieres (ficheros `.env`, archivos de prueba temporal, etc.).
- Tienes control total de lo que entra en el commit.

**El formato del commit:** `feat(allergens): descripcion` sigue [Conventional Commits](https://www.conventionalcommits.org/). `feat` = nueva funcionalidad, `(allergens)` = area afectada.

---

### Paso 10: Crear la Pull Request

Desde GitHub (o con la CLI `gh`):

```bash
gh pr create --base dev --title "feat(allergens): add GET /allergens/:id endpoint" --body "$(cat <<'EOF'
### Tipus
- [x] feat

### Que he fet
Implementat l'endpoint GET /api/v1/allergens/:id que retorna un al·lergen
concret pel seu identificador UUID.

**Canvis:**
- Afegit `findById` al port `AllergenRepository`
- Implementat `findById` al `AllergenService` amb validacio d'ID buit
- Implementat `findById` al `PgAllergenRepository` amb query SELECT
- Afegit handler `findById` al controller
- Registrada la ruta GET `/allergens/:id` amb validacio de params
- Documentat a Scalar amb exemples (200, 400, 404)
- 4 tests unitaris: cas OK, ID buit, no trobat, error de repo

### Funciona?
- [x] Si
EOF
)"
```

**Por que:**
- `--base dev` indica que quieres mergear tu rama hacia `dev` (la rama principal del proyecto).
- El cuerpo de la PR usa la plantilla del proyecto (esta en `.github/pull_request_template.md`).
- Esta en catalan porque la documentacion y UI del proyecto son en catalan (convencion del equipo).

---

## Checklist final

Antes de pedir la review, comprueba:

- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm lint` pasa sin errores
- [ ] `pnpm test` pasa sin errores (incluidos tus 4 tests nuevos)
- [ ] Has probado manualmente con `pnpm dev` y:
  - `GET /api/v1/allergens/:id` con un UUID existente → 200
  - `GET /api/v1/allergens/:id` con un UUID que no existe → 404
  - `GET /api/v1/allergens/no-soy-uuid` → 400 (el middleware lo rechaza)
- [ ] La documentacion en `/docs` muestra el nuevo endpoint
- [ ] La PR apunta a `dev`, no a `main`

---

## Resumen de ficheros tocados

| Fichero | Que hiciste |
|---------|-------------|
| `src/domain/ports/drivens/AllergenRepository.ts` | Anadiste `findById` a la interfaz |
| `src/domain/services/AllergenService.ts` | Anadiste `findById` con validacion |
| `src/infrastructure/drivens/persistence/pg/PgAllergenRepository.ts` | Anadiste `findById` con query SQL |
| `src/infrastructure/drivers/http/controllers/allergenController.ts` | Anadiste handler `findById` |
| `src/infrastructure/drivers/http/routes/allergenRoutes.ts` | Registraste la ruta GET |
| `src/infrastructure/drivers/http/docs/registry.ts` | Documentaste en OpenAPI |
| `tests/domain/services/AllergenService.test.ts` | Anadiste 4 tests |

7 ficheros. 0 ficheros nuevos. Todo siguiendo el patron del delete que ya existia.

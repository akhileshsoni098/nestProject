# 🏗️ NestJS Project — Zero se Hero (Express se NestJS tak)

> ** Tum ek baat yaad rakhna:** Express mein tum apne hisaab se code likhte the — koi structure nahi tha. NestJS mein **structure already defined hai** — tum sirf usme fit ho jao. Pehle thoda overload lagega, but 2-4 projects ke baad Express boring lagega.

---

## 📋 Table of Contents

1. [Express vs NestJS — Big Picture](#1-express-vs-nestjs--big-picture)
2. [NestJS Architecture — 4 Pillars](#2-nestjs-architecture--4-pillars)
3. [Project Structure — Har folder ka matlab](#3-project-structure--har-folder-ka-matlab)
4. [File-by-file Explanation (Express comparison ke saath)](#4-file-by-file-explanation-express-comparison-ke-saath)
5. [The Data Flow — Request ka safar](#5-the-data-flow--request-ka-safar)
6. [Deep Dive: Why DTO?](#6-deep-dive-why-dto)
7. [Deep Dive: Why Two DTOs? (RegisterDto vs CreateUserDto)](#7-deep-dive-why-two-dtos-registerdto-vs-createuserdto)
8. [Deep Dive: Dependency Injection](#8-deep-dive-dependency-injection)
9. [Deep Dive: @Global() Module](#9-deep-dive-global-module)
10. [Password Flow — bcrypt ka kamaal](#10-password-flow--bcrypt-ka-kamaal)
11. [Database Schema — Table ka design](#11-database-schema--table-ka-design)
12. [How to Run This Project](#12-how-to-run-this-project)
13. [API Testing — Endpoints + Examples](#13-api-testing--endpoints--examples)
14. [Common Mistakes (Express se aate hue)](#14-common-mistakes-express-se-aate-hue)
15. [Next Steps — Kya aage seekhna hai](#15-next-steps--kya-aage-seekhna-hai)
16. [NestJS Glossary — Har concept ek line mein](#16-nestjs-glossary--har-concept-ek-line-mein)

---

## 1. Express vs NestJS — Big Picture

Pehle Express ka typical code dekhte hain, phir NestJS ka:

### Express (tumhara purana tareeka)

```js
// Express mein — koi structure nahi, sab kuch ek file mein daal do
const express = require('express');
const app = express();

app.post('/users', async (req, res) => {
  const { fname, lname, email, password, role } = req.body;
  // Validation manual karni padegi
  if (!fname || !email) return res.status(400).json({ error: 'Missing fields' });
  
  // DB logic bhi yahi
  const user = await db.query('INSERT INTO users ...');
  res.status(201).json(user);
});

app.listen(3000);
```

### NestJS (naya tareeka)

```ts
// NestJS mein — responsibility alag-alag files mein divided

// Controller — sirf route handle karta hai
@Controller('users')
export class UsersController {
  @Post()
  create(@Body() dto: CreateUserDto) {  // Validation auto ho gayi DTO se
    return this.usersService.create(dto); // Sirf service ko call karo
  }
}

// Service — business logic yahan
@Injectable()
export class UsersService {
  async create(dto: CreateUserDto) {
    // DB logic, password hashing, etc.
  }
}
```

### Side-by-side Comparison

| Cheez | Express mein | NestJS mein |
|---|---|---|
| **Route banana** | `app.get('/users', handler)` | `@Controller('users')` + `@Get()` decorator |
| **Request body** | `req.body` — manually parse + validate | `@Body() dto: CreateUserDto` — auto validation |
| **URL params** | `req.params.id` — string aati hai | `@Param('id', ParseIntPipe) id: number` — auto number |
| **Business logic** | Route handler ke andar daal do | Alag file — Service (`@Injectable()`) |
| **Organisation** | Koi structure nahi, tum decide karo | Module → Controller → Service → DTO — fixed pattern |
| **Validation** | Manual if-else | Decorators: `@IsEmail()`, `@IsString()`, etc. |
| **Dependencies** | `require()` / `import` manually | Dependency Injection — NestJS auto dega |
| **Error handling** | try-catch + res.status() | Exceptions: `NotFoundException`, `ConflictException` |
| **Code reusability** | Copy-paste karo | Service ko export karo, doosra module import kare |

### Express se Nest mein aane par yeh yaad rakhna:

1. **Everything is a class** — Express mein functions the, Nest mein classes hain
2. **Decorators (`@`) kaam karte hain** — `@Controller()`, `@Get()`, `@Body()` — yeh metadata attach karte hain
3. **Request-response cycle NestJS handle karta hai** — tum sirf logic do
4. **File structure matters** — har cheez ki designated jagah hai

---

## 2. NestJS Architecture — 4 Pillars

NestJS 4 main cheezon par bana hai. Express mein itni clarity nahi thi:

```
┌─────────────────────────────────────────────────┐
│                  MODULE                          │
│  (Logical boundary — app ka ek section)         │
│                                                   │
│  ┌───────────────────┐  ┌───────────────────┐   │
│  │    CONTROLLER      │  │     SERVICE       │   │
│  │  (Routes handle)   │  │  (Business logic) │   │
│  └───────────────────┘  └───────────────────┘   │
│                                                   │
│  ┌───────────────────┐                           │
│  │       DTO         │                           │
│  │  (Validation)     │                           │
│  └───────────────────┘                           │
└─────────────────────────────────────────────────┘
```

### 1. Module (`@Module`)
**Express mein:** Koi concept nahi tha. Tum saare routes ek file mein ya alag-alag folders mein daal sakte the — koi rule nahi.

**NestJS mein:** `@Module({})` ek logical boundary banata hai. Jaise:
- `UsersModule` — user-related saara code yahi rahega
- `AuthModule` — authentication ka saara code yahi rahega
- `DatabaseModule` — database connection yahi manage hoga

Module decide karta hai ki **kaunse Controller hain, kaunse Services hain, aur kya export karna hai** doosron ke liye.

### 2. Controller (`@Controller`)
**Express mein:** `app.get('/users', handler)` — route + logic ek saath.

**NestJS mein:** Controller sirf **route define** karta hai aur **service ko call** karta hai. Logic nahi hoti controller mein.

```ts
// Express
app.get('/users/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// NestJS
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);  // Sirf delegate
}
```

### 3. Service / Provider (`@Injectable`)
**Express mein:** Logic route mein ya ek alag helper file mein — koi standard nahi.

**NestJS mein:** `@Injectable()` class — **business logic yahi rehti hai**. Service ek provider hai jo NestJS ki **Dependency Injection** system mein register hoti hai.

### 4. DTO (Data Transfer Object)
**Express mein:** `req.body` directly use karte the, validation manual.

**NestJS mein:** DTO ek class hai jo **request body ka shape define** karti hai + **validation decorators** lagte hain. (Iske baare mein neeche detail mein dekhenge)

---

## 3. Project Structure — Har folder ka matlab

```
my_first_project/
│
├── src/                           # Saara code yahan
│   │
│   ├── main.ts                    # ⭐ Entry point — app yahan start hoti hai
│   ├── app.module.ts              # ⭐ Root module — saare modules ko import karta hai
│   ├── app.controller.ts          # 👋 Hello World route (GET /)
│   ├── app.service.ts             # 👋 Hello World logic
│   │
│   ├── db/                        # 🗄️ Database module (GLOBAL)
│   │   ├── database.module.ts     #   @Global() — kisi ko import nahi karna padta
│   │   ├── database.service.ts    #   PostgreSQL pool + Drizzle instance
│   │   └── schema.ts              #   Barrel re-export (aggregates all module schemas)
│   │
│   ├── users/                     # 👤 Users module (DATA OWNER)
│   │   ├── users.module.ts        #   exports UsersService taaki Auth use kare
│   │   ├── users.controller.ts    #   CRUD routes — GET/POST/PATCH/DELETE /users
│   │   ├── users.service.ts       #   Saari user DB logic yahan
│   │   ├── schema.ts              #   🆕 Table definitions (module-wise schema!)
│   │   └── dto/
│   │       ├── create-user.dto.ts #   Validation: new user ke liye
│   │       ├── update-user.dto.ts #   PartialType — saare fields optional
│   │       └── index.ts           #   Barrel export
│   │
│   └── auth/                      # 🔐 Auth module (DELEGATOR)
│       ├── auth.module.ts         #   imports UsersModule (UsersService access)
│       ├── auth.controller.ts     #   POST /auth/register, POST /auth/login
│       ├── auth.service.ts        #   UsersService ko call karta hai (DB direct nahi)
│       └── dto/
│           ├── register.dto.ts    #   Registration form fields
│           ├── login.dto.ts       #   Login form fields
│           └── index.ts           #   Barrel export
│
├── drizzle.config.ts              # Drizzle kit configuration
├── nest-cli.json                  # NestJS CLI config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies + scripts
└── .env                           # Environment variables
```

### Design Rule — Project ka sabse important concept:

```
┌────────────────────────────────────────────────────┐
│                   RULE                              │
│                                                     │
│   AuthModule → calls → UsersService → Database     │
│   (delegator)         (data owner)                  │
│                                                     │
│   AuthModule DB ko DIRECT nahi chhoot sakta         │
│   UsersService ke through hi jaayega                │
└────────────────────────────────────────────────────┘
```

**Kyun?** — Code duplicate nahi hona chahiye. Agar Auth bhi DB chhootega aur Users bhi DB chhootega, to ek hi query do jagah likhni padegi. Isliye **UsersService ek single source of truth hai** user data ke liye.

---

## 4. File-by-file Explanation (Express comparison ke saath)

### 4.1 `main.ts` — Entry Point

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

**Express mein equivalent:**
```js
// Express
const app = express();
app.listen(3000);
```

**Kya ho raha hai?**
- `NestFactory.create(AppModule)` — NestJS AppModule ko load karta hai. AppModule recursively saare modules, controllers, services ko resolve karta hai.
- `app.listen(PORT)` — Server start karta hai
- `void bootstrap()` — JavaScript warning suppress. `bootstrap()` ek Promise return karta hai, hum intentionally `await` nahi kar rahe top-level par.

### 4.2 `app.module.ts` — Root Module

```ts
@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Express mein equivalent:** Kuch nahi. Express mein app.js mein saara kuch daal dete the. NestJS mein yeh module batata hai ki **kaunse modules available hain**.

**`ConfigModule.forRoot()`** — `@nestjs/config` se aata hai. Yeh `.env` file padhkar `process.env` mein daal deta hai. Isliye aaj se pehle `.env` file load nahi ho rahi thi (kyunki ConfigModule import nahi tha).

### 4.3 `app.controller.ts` + `app.service.ts` — Hello World

```ts
// Controller
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

// Service
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

**Express mein equivalent:**
```js
app.get('/', (req, res) => {
  res.send('Hello World!');
});
```

**Yahan kya seekhna hai?** — NestJS mein Controller constructor mein `AppService` ko **inject** kar raha hai. NestJS auto create karega `AppService` ka instance aur controller ko dega. Express mein tum khud `new AppService()` karte.

### 4.4 `database.module.ts` + `database.service.ts` — Database Connection

```ts
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

```ts
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  private dbInstance!: ReturnType<typeof drizzle<typeof schema>>;

  onModuleInit() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    this.pool = new Pool({ connectionString });
    this.dbInstance = drizzle(this.pool, { schema });
  }

  get db() {
    return this.dbInstance;
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.end();
  }
}
```

**Express mein equivalent:**
```js
// Express — pool ek alag file mein
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = pool;

// Aur phir route mein:
const pool = require('./db');
app.get('/users', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users');
  res.json(rows);
});
```

**NestJS mein kya alag hai?**
- `@Global()` — DatabaseModule ko global scope milta hai. Matlab kisi bhi module mein `DatabaseService` import kiye bina use kar sakte ho.
- `OnModuleInit` — App start hote hi NestJS `onModuleInit()` call karega. Yahan pool create karo.
- `OnModuleDestroy` — App band hote hi `onModuleDestroy()` call karega. Yahan pool close karo.
- `private pool!: Pool` — `!` ka matlab: "TypeScript, yeh property runtime mein initialize hogi, error mat do"

### 4.5 `schema.ts` — Module-wise Table Definition (Drizzle ORM)

**Naya pattern — Module-wise Schema:** Har module apni table definition khud rakhta hai.

**`src/users/schema.ts`** — Users table ki actual definition yahan hai:
```ts
export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fname: text('fname').notNull(),
  lname: text('lname').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default('student'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_unique_idx').on(table.email),
}));
```

**`src/db/schema.ts`** — Sirf re-export karta hai (aggregator):
```ts
export * from '../users/schema';
// Future: export * from '../products/schema';
// Future: export * from '../orders/schema';
```

**Kyun module-wise?**
- Har module apni table definition khud rakhta hai — **Single Responsibility**
- Naya module add karo → uski schema usi folder mein → `db/schema.ts` mein export add karo
- `database.service.ts` sirf `db/schema.ts` se import karta hai — usse farak nahi padta
- `drizzle.config.ts` sirf actual schema files ko point karta hai

**Express mein equivalent:**
```sql
-- SQL migration file
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  fname TEXT NOT NULL,
  ...
);
```

**Drizzle ORM kyun use kiya?** — TypeScript ka type safety. `User` type directly table se infer ho jata hai:
```ts
export type User = typeof users.$inferSelect;     // SELECT karne par milta hai
export type NewUser = typeof users.$inferInsert;  // INSERT karne par chahiye
```

Express mein tum khud types likhte ya `any` use karte.

### 4.6 `users.controller.ts` — User CRUD Routes

```ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()     create(@Body() dto: CreateUserDto)          → POST   /users
  @Get()      findAll()                                    → GET    /users
  @Get(':id') findOne(@Param('id', ParseIntPipe) id)       → GET    /users/5
  @Patch(':id') update(@Param('id', ParseIntPipe) id, @Body() dto) → PATCH /users/5
  @Delete(':id') remove(@Param('id', ParseIntPipe) id)     → DELETE /users/5
}
```

**Express mein equivalent:**
```js
const router = express.Router();

router.post('/', async (req, res) => {
  // Validation manually
  const { fname, lname, email, password, role } = req.body;
  if (!fname || !email) return res.status(400).json({ error: 'Validation failed' });
  
  // Logic bhi yahi
  const user = await usersService.create(req.body);
  res.status(201).json(user);
});

router.get('/', async (req, res) => {
  const users = await usersService.findAll();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);  // String → Number manual
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const user = await usersService.findOne(id);
  res.json(user);
});
```

**NestJS advantages:**
- `@Body() dto: CreateUserDto` — validation auto. Agar body mein extra field hai to error. Agar required field missing hai to error.
- `@Param('id', ParseIntPipe) id: number` — auto string-to-number conversion + validation
- `@Controller('users')` — saare routes `/users` se prefix ho gaye

### 4.7 `users.service.ts` — Business Logic

```ts
@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateUserDto) {
    // 1. Email duplicate check
    const existing = await this.database.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email already exists');
    }

    // 2. Password hash
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. INSERT
    const [created] = await this.database.db
      .insert(users)
      .values({ ...dto, password: hashedPassword })
      .returning();

    return created;
  }

  async update(id: number, dto: UpdateUserDto) {
    const payload: Partial<typeof users.$inferInsert> = {};

    // Sirf wahi fields SET karo jo actually di gayi hain
    if (dto.fname !== undefined) payload.fname = dto.fname;
    if (dto.lname !== undefined) payload.lname = dto.lname;
    if (dto.email !== undefined) payload.email = dto.email;

    if (Object.keys(payload).length === 0) return this.findOne(id);

    const [updated] = await this.database.db
      .update(users)
      .set({ ...payload, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`User with id ${id} not found`);
    return updated;
  }

  async remove(id: number) {
    const [deleted] = await this.database.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) throw new NotFoundException(`User with id ${id} not found`);
    return { deleted: true, id: deleted.id };
  }
}
```

**Express mein equivalent:**
```js
// Express — typically route mein hi logic hoti thi
app.post('/users', async (req, res) => {
  try {
    // Email check
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [req.body.email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    // Hash
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Insert
    const result = await pool.query(
      'INSERT INTO users (fname, lname, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.body.fname, req.body.lname, req.body.email, hashedPassword, req.body.role]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
```

**Dhyan do:** NestJS mein `ConflictException`, `NotFoundException` auto 409/404 status code set kar dete hain. Express mein manually `res.status().json()` karna padta.

### 4.8 `auth.controller.ts` + `auth.service.ts` — Authentication

```ts
// Controller
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)  // POST default 201 hota hai, login ke liye 200 chahiye
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

// Service
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const createUserDto = new CreateUserDto();
    Object.assign(createUserDto, dto);  // RegisterDto → CreateUserDto (same fields)
    return this.usersService.create(createUserDto);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await this.usersService.validatePassword(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }
}
```

**Express mein equivalent:**
```js
// Express — saara logic ek route mein
app.post('/auth/register', async (req, res) => {
  const user = await usersService.create(req.body);  // Direct call
  res.status(201).json(user);
});

app.post('/auth/login', async (req, res) => {
  const user = await usersService.findByEmail(req.body.email);
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json(user);
});
```

**Key difference:** AuthService `UsersService` ko call kar raha hai, DB ko direct nahi. Agar future mein tum JWT add karo ge, to sirf `AuthService` badlegi, `UsersService` nahi.

### 4.9 DTOs — Validation Classes

**create-user.dto.ts**
```ts
export enum UserRole { student = 'student', admin = 'admin' }

export class CreateUserDto {
  @IsString()   @IsNotEmpty() fname!: string;
  @IsString()   @IsNotEmpty() lname!: string;
  @IsEmail()    @IsNotEmpty() email!: string;
  @IsString()   @IsNotEmpty() password!: string;
  @IsEnum(UserRole) @IsNotEmpty() role!: UserRole;
}
```

**update-user.dto.ts**
```ts
export class UpdateUserDto extends PartialType(CreateUserDto) {}
// PartialType saare fields ko optional bana deta hai
// CreateUserDto: fname, lname, email, password, role — sab required
// UpdateUserDto: fname?, lname?, email?, password?, role? — sab optional
```

**register.dto.ts**
```ts
export class RegisterDto {
  @IsString()   @IsNotEmpty() fname!: string;
  @IsString()   @IsNotEmpty() lname!: string;
  @IsEmail()    @IsNotEmpty() email!: string;
  @IsString()   @IsNotEmpty() password!: string;
  @IsEnum(UserRole) @IsNotEmpty() role!: UserRole;
}
```

**login.dto.ts**
```ts
export class LoginDto {
  @IsEmail()    @IsNotEmpty() email!: string;
  @IsString()   @IsNotEmpty() password!: string;
}
```

---

## 5. The Data Flow — Request ka safar

Jab koi request aati hai, to Express aur NestJS mein kaise travel karti hai?

### Express Data Flow
```
REQUEST
  │
  ▼
app.post('/auth/register', handler)
  │  ┌────────────────────────────┐
  ├──│ 1. req.body se data nikaalo│
  ├──│ 2. Validation manual karo  │
  ├──│ 3. DB query likho          │
  ├──│ 4. Password hash karo      │
  ├──│ 5. res.json() bhejo        │
  │  └────────────────────────────┘
  ▼
RESPONSE
```

**Problem:** Saara logic ek hi jagah. Test karna mushkil. Code reuse nahi hota.

### NestJS Data Flow
```
REQUEST (POST /auth/register)
  │
  ▼
┌──────────────────────────────────────────┐
│ 1. AuthController.register()             │
│    @Post('register') @Body() dto         │
│    → Validation auto (DTO decorators)    │
└────────────────┬─────────────────────────┘
                 │ calls
                 ▼
┌──────────────────────────────────────────┐
│ 2. AuthService.register(dto)             │
│    → RegisterDto → CreateUserDto convert │
│    → UsersService.create() ko call       │
│    (DB direct nahi chhoot raha)          │
└────────────────┬─────────────────────────┘
                 │ calls
                 ▼
┌──────────────────────────────────────────┐
│ 3. UsersService.create(createUserDto)    │
│    → Email duplicate check               │
│    → bcrypt.hash(password)               │
│    → DatabaseService.db.insert(...)      │
│    → Return created user                 │
└────────────────┬─────────────────────────┘
                 │ uses
                 ▼
┌──────────────────────────────────────────┐
│ 4. DatabaseService (Drizzle ORM)         │
│    → PostgreSQL Pool                     │
│    → INSERT INTO users ...               │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│ 5. Response travels back                 │
│    UsersService → AuthService → Controller│
│    → JSON response                       │
└──────────────────────────────────────────┘
  │
  ▼
RESPONSE (201 Created + user data)
```

### Visual Dependency Tree

```
AppModule
  │
  ├── ConfigModule.forRoot()     ← .env file load
  │
  ├── DatabaseModule (@Global)
  │   └── DatabaseService        ← sirf ek baar bana, saari jagah same instance
  │
  ├── UsersModule
  │   ├── schema.ts        ─── Users table definition (module-wise schema)
  │   ├── UsersController  ─── routes: GET/POST/PATCH/DELETE /users
  │   ├── UsersService     ─── business logic (injects DatabaseService)
  │   └── exports: [UsersService]  ← AuthModule ke liye available
  │
  ├── AuthModule
  │   ├── imports: [UsersModule]  ← taaki UsersService use kar sake
  │   ├── AuthController ─── routes: POST /auth/register, POST /auth/login
  │   └── AuthService     ─── authentication logic (injects UsersService)
  │
  └── AppController + AppService  ← Hello World
```

---

## 6. Deep Dive: Why DTO?

**Sabse common question:** "DTO kyun? Direct req.body kyun nahi use kar sakte?"

### Express ka tareeka (Without DTO)

```ts
// Express
app.post('/users', async (req, res) => {
  const { fname, lname, email, password, role } = req.body;

  // Manual validation — har baar likhna padega
  if (!fname || typeof fname !== 'string') return res.status(400).json(...);
  if (!email || !email.includes('@')) return res.status(400).json(...);
  if (!password || password.length < 6) return res.status(400).json(...);

  // Ab pata chala required fields hain? Kaam kar lo
  const user = await createUser({ fname, lname, email, password, role });
  res.status(201).json(user);
});
```

**Problems in Express approach:**
1. **Har route mein validation repeat** — 10 routes hain to 10 baar same if-else
2. **Body mein extra fields aa sakti hain** — koi bhej de `isAdmin: true` kaise rokoge?
3. **Type safety nahi** — `email` string hai ya number? pata nahi
4. **Documentation nahi** — endpoint ko hit kiye bina pata nahi kaunse fields chahiye

### NestJS ka tareeka (With DTO)

```ts
// Define karo ek baar
export class CreateUserDto {
  @IsString()   @IsNotEmpty()                fname!: string;
  @IsString()   @IsNotEmpty()                lname!: string;
  @IsEmail()    @IsNotEmpty()                email!: string;
  @IsString()   @IsNotEmpty() @MinLength(6)  password!: string;
  @IsEnum(UserRole) @IsNotEmpty()           role!: UserRole;
}

// Use karo har jagah
@Post()
create(@Body() dto: CreateUserDto) {   // Auto-validated!
  return this.usersService.create(dto);
}
```

**Benefits:**
1. **Validation auto** — `@IsEmail()` → email format sahi hai? nahi to 400 error auto
2. **Whitelist** — Extra fields (like `isAdmin`) auto hata dega `whitelist: true` ke saath
3. **TypeScript type safety** — `dto.fname` string hai, `dto.role` UserRole enum hai
4. **Self-documenting** — ek baar class dekh lo, pata chal jayega kaunse fields required hain
5. **Reusable** — `CreateUserDto` ko 10 controllers use kar sakte hain

### What is `!` (non-null assertion)?

```ts
fname!: string;
```

Yeh TypeScript ko bata raha hai: "Chinta mat kar, yeh property runtime mein initialize ho jayegi."

Normal TypeScript mein properties ko constructor mein initialize karna hota hai:
```ts
class User {
  name: string;  // Error: Property 'name' has no initializer
  constructor(name: string) { this.name = name; }
}
```

Lekin DTOs mein constructor nahi hota — NestJS class-validator runtime par values assign karta hai. Isliye `!` lagate hain.

### What is `PartialType`?

```ts
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

- `CreateUserDto` — sab fields required
- `PartialType(CreateUserDto)` — sab fields optional banata hai
- Update mein sirf wahi fields do jo change karne hain

**Express mein:** Har field check karni padti:
```js
if (req.body.fname !== undefined) payload.fname = req.body.fname;
if (req.body.lname !== undefined) payload.lname = req.body.lname;
// ...
```

NestJS mein DTO hi bata dega ki kaunse fields aa sakte hain.

---

## 7. Deep Dive: Why Two DTOs? (RegisterDto vs CreateUserDto)

**Question:** Dono DTOs same hain, to do alag file kyun?

```
RegisterDto                  CreateUserDto
─────────────────            ─────────────────
fname: string                fname: string
lname: string                lname: string
email: string                email: string
password: string             password: string
role: UserRole               role: UserRole
```

**Reason — Separation of Concerns (SRP):**

1. **RegisterDto** — Auth module ka DTO hai. Ye sirf **registration form** ke liye design kiya gaya. Future mein ismein extra fields aa sakti hain (jaise `phone`, `referralCode`).

2. **CreateUserDto** — Users module ka DTO hai. Ye **database mein user create** karne ke liye hai. Iska shape change nahi hona chahiye.

3. **Bada reason:** Agar tum sirf ek DTO rakhte (CreateUserDto) aur Auth bhi wahi use karta, to:
   - Users module ka DTO badle to Auth ke routes bhi badal jayenge
   - Auth ke specific requirements (jaise `confirmPassword` field) Users DTO mein nahi daal sakte

**Current code mein** — `AuthService.register()` `RegisterDto` ko `CreateUserDto` mein map kar raha hai:
```ts
async register(dto: RegisterDto) {
  const createUserDto = new CreateUserDto();
  createUserDto.fname = dto.fname;   // Explicit mapping
  createUserDto.lname = dto.lname;
  // ...
  return this.usersService.create(createUserDto);
}
```

**Future scenario:** Maan lo Register mein `phone` field add karna hai, to sirf `RegisterDto` mein daalo. `CreateUserDto` nahi badlega.

---

## 8. Deep Dive: Dependency Injection

**Express mein:**
```js
// Express — manual dependency management
const db = require('./db');
const userService = new UserService(db);  // Khud banana pada

app.get('/users', (req, res) => {
  userService.findAll().then(users => res.json(users));
});
```

**NestJS mein:**
```ts
// NestJS — Nest auto inject karega
@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}
  // NestJS ne apne aap DatabaseService ka instance diya
}

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  // NestJS ne apne aap UsersService ka instance diya
}
```

### DI Kaise kaam karta hai?

```
App Start
  │
  ▼
NestJS scans saare modules
  │
  ▼
NestJS creates a "Dependency Graph"
  │
  ├── DatabaseService — kisi aur par depend nahi karta → pehle create
  ├── UsersService — depends on DatabaseService → phir create
  └── AuthService — depends on UsersService → sabse baad create
  │
  ▼
Jab bhi koi class UsersService maange, NestJS wahi singleton instance dega
```

**Benefits:**
- Ek hi instance (singleton) — memory efficient
- Test karte waqt mock inject kar sakte ho
- Lifecycle NestJS handle karta hai — kab create karna hai, kab destroy

---

## 9. Deep Dive: @Global() Module

```ts
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

### Without @Global()

Agar `@Global()` na ho, to har module jo `DatabaseService` use karna chahta hai, usse pehle `DatabaseModule` import karna padega:

```ts
// UsersModule
@Module({
  imports: [DatabaseModule],  // import karna padega
  providers: [UsersService],
})
export class UsersModule {}

// AuthModule
@Module({
  imports: [UsersModule],  // DatabaseModule nahi... toh DatabaseService kaise milega?
})
export class AuthModule {}
```

**Problem:** `DatabaseModule` ko har module mein import karna padega jahan `DatabaseService` chahiye.

### With @Global()

```ts
@Global()
export class DatabaseModule {}  // Global scope

// UsersModule — DatabaseModule import kiye bina use kar sakta hai
@Module({
  providers: [UsersService],
})
export class UsersModule {}
```

**Rule of thumb:** Sirf wahi modules global banao jo **actually almost har jagah chahiye** (jaise Database, Logger, Config). Baki modules ko normally import karo.

---

## 10. Password Flow — bcrypt ka kamaal

### Registration

```
User submits: { password: "secret123" }
  │
  ▼
AuthService → UsersService.create()
  │
  ▼
bcrypt.hash("secret123", 10)
  │
  ▼
Result: "$2b$10$XQx... (60 character ka string)"
  │
  ▼
DB mein store: users.password = "$2b$10$XQx..."
```

**bcrypt.hash(password, 10):**
- `10` = salt rounds (cost factor)
- Jitna zyada, utna slow (but secure)
- `10` is standard — ~100ms lagta hai
- Output automatically salt include karta hai (har baar different)

**Express mein bhi same — lekin manually**
```js
const hashedPassword = await bcrypt.hash(req.body.password, 10);
await pool.query('INSERT INTO users (password) VALUES ($1)', [hashedPassword]);
```

### Login

```
User submits: { email: "test@test.com", password: "secret123" }
  │
  ▼
AuthService → UsersService.findByEmail("test@test.com")
  │
  ▼
User mila: { password: "$2b$10$XQx..." }
  │
  ▼
UsersService.validatePassword("secret123", "$2b$10$XQx...")
  │
  ▼
bcrypt.compare("secret123", "$2b$10$XQx...")
  │
  ├── true  → Login success, return user
  └── false → 401 Unauthorized
```

**bcrypt.compare() kaise kaam karta hai?**
- Pehle hashed string se salt nikaalta hai (`$2b$10$XQx...`)
- Phir input password ko same salt se hash karta hai
- Dono hash match? → valid password

**Important:** `user.password` ko kabhi bhi response mein mat bhejo. Abhi currently pure user object return ho raha hai (including password). JWT add karte waqt isko fix karna hai.

---

## 11. Database Schema — Table ka design

**Location:** `src/users/schema.ts` (module-wise — users module apni schema khud rakhta hai)

```ts
export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);

export const users = pgTable('users', {
  id:        serial('id').primaryKey(),            // Auto-increment
  fname:     text('fname').notNull(),              // Required string
  lname:     text('lname').notNull(),              // Required string
  email:     text('email').notNull(),              // Unique (index)
  password:  text('password').notNull(),           // Hashed password
  role:      userRoleEnum('role').notNull().default('student'),  // Enum, default = student
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_unique_idx').on(table.email),
}));
```

### SQL Equivalent

```sql
CREATE TYPE user_role AS ENUM ('student', 'admin');

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  fname      TEXT NOT NULL,
  lname      TEXT NOT NULL,
  email      TEXT NOT NULL,
  password   TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_email_unique_idx ON users (email);
```

### TypeScript Types Auto-Generated

```ts
// SELECT karne par yeh type milti hai
type User = {
  id: number;
  fname: string;
  lname: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// INSERT karne ke liye yeh type chahiye
type NewUser = {
  fname: string;
  lname: string;
  email: string;
  password: string;
  role: 'student' | 'admin';
  createdAt?: Date;   // Optional — defaultNow() hai
  updatedAt?: Date;   // Optional — defaultNow() hai
}
```

---

## 12. How to Run This Project

### Prerequisites

- Node.js v18+
- PostgreSQL (local ya Docker mein)
- npm ya yarn

### Step 1: PostgreSQL Database Setup

```bash
# PostgreSQL mein database banao
psql -U postgres -c "CREATE DATABASE nest_app_test_db;"
```

Ya Docker se:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=12345678 -e POSTGRES_DB=nest_app_test_db -p 5432:5432 -d postgres:16
```

### Step 2: Environment Variables

`.env` file already configured:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/nest_app_test_db
```

Agar tumhara PostgreSQL username/password alag hai to `.env` update karo.

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Push Schema to Database (Tables banao)

```bash
npx drizzle-kit push
```

Ye command `schema.ts` padhegi aur PostgreSQL mein `users` table create karegi.

### Step 5: Start Server

```bash
npm run start:dev
```

Server `http://localhost:3001` par start hoga.

---

## 13. API Testing — Endpoints + Examples

### Hello World

```bash
curl http://localhost:3001
# Response: Hello World!
```

### Register User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fname": "Rahul",
    "lname": "Sharma",
    "email": "rahul@test.com",
    "password": "secret123",
    "role": "student"
  }'
```

**Success Response (201):**
```json
{
  "id": 1,
  "fname": "Rahul",
  "lname": "Sharma",
  "email": "rahul@test.com",
  "password": "$2b$10$...",
  "role": "student",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

> ⚠️ **Note:** Password response mein aa raha hai. JWT implement karte waqt isko nahi bhejna chahiye.

**Duplicate Email (409):**
```json
{ "message": "Email already exists", "statusCode": 409, "error": "Conflict" }
```

**Validation Error (400):**
```json
{
  "message": ["email must be an email", "fname should not be empty"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@test.com",
    "password": "secret123"
  }'
```

**Success (200):**
```json
{ "id": 1, "fname": "Rahul", ... }
```

**Invalid credentials (401):**
```json
{ "message": "Invalid credentials", "error": "Unauthorized", "statusCode": 401 }
```

### Get All Users

```bash
curl http://localhost:3001/users
```

**Response (200):**
```json
[{ "id": 1, "fname": "Rahul", ... }]
```

### Get User By ID

```bash
curl http://localhost:3001/users/1
```

**Not Found (404):**
```json
{ "message": "User with id 99 not found", "error": "Not Found", "statusCode": 404 }
```

### Update User

```bash
curl -X PATCH http://localhost:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{ "fname": "Rahul Kumar" }'
```

### Delete User

```bash
curl -X DELETE http://localhost:3001/users/1
```

**Response:** `{ "deleted": true, "id": 1 }`

---

## 14. Common Mistakes (Express se aate hue)

### ❌ Direct DB access from AuthService

```ts
// GALAT — AuthService DB ko direct chhoot raha hai
@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  async login(email: string) {
    const [user] = await this.database.db.select().from(users).where(eq(users.email, email));
    // ...
  }
}
```

**Sahi tarika:** `AuthService` → `UsersService.findByEmail()` → `DatabaseService`

### ❌ Business logic in Controller

```ts
// GALAT — Controller mein logic
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);  // ❌ Logic yahan nahi
    // ...
  }
}
```

**Sahi tarika:** Controller sirf route handle kare, Service ko call kare.

### ❌ Without DTO — using `any`

```ts
// GALAT — DTO ki jagah any
@Post()
create(@Body() body: any) {  // ❌ Koi validation nahi
  return this.usersService.create(body);
}
```

### ❌ Forget to handle not found

```ts
// GALAT — 404 check nahi kiya
async findOne(id: number) {
  const [user] = await this.database.db.select().from(users).where(eq(users.id, id));
  return user;  // ❌ undefined return ho sakta hai
}
```

**Sahi tarika:**
```ts
async findOne(id: number) {
  const [user] = await this.database.db.select().from(users).where(eq(users.id, id));
  if (!user) throw new NotFoundException(`User with id ${id} not found`);
  return user;
}
```

### ❌ Password in response

Abhi password response mein aa raha hai. Express mein bhi tum `res.json(user)` karte to password chhupana bhool jaate. NestJS mein bhi same cheez.

---

## 15. Next Steps — Kya aage seekhna hai

### 1️⃣ Add ValidationPipe in main.ts

```ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Extra fields auto remove
    forbidNonWhitelisted: true,   // Extra fields par error
    transform: true,              // Auto type conversion (string → number, etc.)
  }));

  await app.listen(process.env.PORT ?? 3000);
}
```

`whitelist: true` ka matlab:
- Agar request mein extra field hai (jo DTO mein nahi), to use auto hata do
- Jaise koi bhejde `{ fname: "Rahul", isAdmin: true }` — `isAdmin` hata diya jayega

### 2️⃣ JWT Authentication

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```

- Login par JWT token return karo
- `@AuthGuard()` se protected routes banao
- Password ko response mein mat bhejo

### 3️⃣ Role-Based Access

- `@Roles('admin')` decorator banao
- Guard check kare ki user ke role mein access hai ya nahi

### 4️⃣ Password Hiding

Response mein password na aaye, iske liye:
- DTO mein `@Exclude()` decorator use karo (class-transformer se)
- Ya manually `delete user.password`

### 5️⃣ Drizzle Migrations

```bash
npx drizzle-kit generate   # Migration files banao
npx drizzle-kit migrate    # DB mein apply karo
npx drizzle-kit push       # Direct push (dev ke liye)
```

---

## 16. NestJS Glossary — Har concept ek line mein

| Concept | Express Equivalent | Explanation |
|---|---|---|
| **Module** | Koi equivalent nahi | Logical grouping. `@Module({})` — app ka ek section |
| **Controller** | `express.Router()` | Routes handle karta hai. `@Controller()`, `@Get()`, `@Post()` |
| **Service** | Helper/Utility file | Business logic. `@Injectable()` — DI se inject hota hai |
| **Provider** | — | Service, Repository, Factory — koi bhi injectable cheez |
| **DTO** | `req.body` manual parse | Request body ka shape + validation. `class-validator` decorators |
| **Pipe** | `parseInt()` / manual validation | Data transform + validate. Jaise `ParseIntPipe`, `ValidationPipe` |
| **Guard** | Middleware (auth check) | Request allow ya deny karta hai |
| **Middleware** | `app.use()` | Request/response modify karta hai |
| **Interceptor** | — | Response transform, logging, etc. |
| **Decorator** | — | `@` se shuru — metadata attach karta hai |
| **Dependency Injection** | `new Service()` manually | NestJS auto dependencies provide karta hai |
| **`@Injectable()`** | — | Mark karta hai ki yeh class DI system mein register ho |
| **`@Global()`** | — | Module ko global scope deta hai — import ki zaroorat nahi |
| **`PartialType`** | Spread operator (`...`) | Saare fields optional bana deta hai |
| **`ParseIntPipe`** | `parseInt(req.params.id)` | String → Number, fail ho to 400 error |

---

## Quick Reference — Har cheez ka ek line summary

| File | Kya hai? | Express mein kya tha? |
|---|---|---|
| `main.ts` | Server start | `app.listen(3000)` |
| `app.module.ts` | Root module — sabko import karo | Kuch nahi |
| `app.controller.ts` | GET / route | `app.get('/')` |
| `app.service.ts` | Hello World logic | Route mein hi likhte |
| `db/database.module.ts` | DB connection (global) | Ek alag `db.js` file |
| `db/database.service.ts` | Pool + Drizzle instance | `new Pool()` + export |
| `db/schema.ts` | Schema aggregator (re-exports module schemas) | Kuch nahi |
| `users/schema.ts` | ✅ Users table definition (module-wise) | SQL migration files |
| `users/users.module.ts` | User module definition | Kuch nahi |
| `users/users.controller.ts` | CRUD routes /users | `express.Router()` |
| `users/users.service.ts` | User business logic | Route mein ya helper mein |
| `users/dto/create-user.dto.ts` | Validation for create | Manual if-else |
| `users/dto/update-user.dto.ts` | Validation for update | Manual if-else per field |
| `auth/auth.module.ts` | Auth module definition | Kuch nahi |
| `auth/auth.controller.ts` | POST /auth/register, /auth/login | `app.post('/auth/register')` |
| `auth/auth.service.ts` | Auth logic (delegates to UsersService) | Route mein hi likhte |
| `auth/dto/register.dto.ts` | Registration validation | Manual |
| `auth/dto/login.dto.ts` | Login validation | Manual |

---

> **Last tip:** NestJS mein dekhna yeh hai ki **kaun kya karta hai** — Controller sirf route batata hai, Service logic rakhti hai, Module grouping karta hai, DTO validate karta hai. Express mein sab kuch ek saath hota tha. Yeh separation maintain karo, to code clean rahega.

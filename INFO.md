# 🏗️ NestJS Complete Project Recipe — Zero se Hero

> **Ye recipe beginner ke liye hai.** Har step mein command bhi hai, reason bhi hai, aur kya hoga woh bhi.  
> **Express se compare kiya gaya hai** taaki tumhe samajhne mein aasani ho.  
> **Jo bhi file banani hai, uska naam bhi diya hai.**

---

## 📋 Table of Contents

1. [Phase 1: NestJS Project Creation](#phase-1-nestjs-project-creation)
2. [Phase 2: Environment & Config Setup](#phase-2-environment--config-setup)
3. [Phase 3: PostgreSQL + Drizzle ORM Setup](#phase-3-postgresql--drizzle-orm-setup)
4. [Phase 4: Module-wise Schema Pattern](#phase-4-module-wise-schema-pattern)
5. [Phase 5: Validation Pipeline (GlobalValidationPipe)](#phase-5-validation-pipeline-globalvalidationpipe)
6. [Phase 6: Global Exception Filter](#phase-6-global-exception-filter)
7. [Phase 7: DTOs (Data Transfer Objects)](#phase-7-dtos-data-transfer-objects)
8. [Phase 8: UsersService — The Data Owner](#phase-8-usersservice--the-data-owner)
9. [Phase 9: UsersController — Routes](#phase-9-userscontroller--routes)
10. [Phase 10: Auth Module + JWT Authentication](#phase-10-auth-module--jwt-authentication)
11. [Phase 11: Route-wise AuthGuard Application](#phase-11-route-wise-authguard-application)
12. [Phase 12: Profile Moved to Users Module](#phase-12-profile-moved-to-users-module)
13. [Phase 13: Build & Verify](#phase-13-build--verify)
14. [Phase 14: Architecture & File Map Reference](#phase-14-architecture--file-map-reference)
15. [Bonus 1: .env.example](#bonus-1-envexample)
16. [Bonus 2: Known Issues & Fixes](#bonus-2-known-issues--fixes)
17. [Bonus 3: Common Beginner Mistakes](#bonus-3-common-beginner-mistakes)

---

## Phase 1: NestJS Project Creation

> **Goal:** NestJS project folder banao + basic structure samjho

---

### Step 1.1 — Install NestJS CLI globally

**Command:**
```bash
npm i -g @nestjs/cli
```

**Kyun?**  
NestJS CLI ek tool hai jo project generate karta hai. Manual folder banana, files banana, config likhna — beginner ke liye overwhelming ho sakta hai. CLI sab ready de deta hai.

**Kya hoga?**  
`nest` command global available ho jayegi. Check karo:

```bash
nest --version
```

**Express analogy:**  
Express mein aisa koi CLI nahi tha. Tum khud `npm init` karte, manually `app.js` banate, `express` install karte. NestJS CLI sab dega.

---

### Step 1.2 — Create new NestJS project

**Command:**
```bash
nest new my_first_project -p npm
```

- `my_first_project` — project ka naam. Tum apna kuch bhi rakh sakte ho.
- `-p npm` — npm use karega dependencies install karne ke liye. Default pnpm bhi ho sakta hai.

**Kyun?**  
`nest new` ek complete NestJS project banata hai. Tujhe kuch bhi manually setup nahi karna.

**Kya hoga?**  
Ye folder structure bane ga:

```
my_first_project/
├── src/
│   ├── main.ts              ← ⭐ Entry point (app yahan start)
│   ├── app.module.ts        ← ⭐ Root module (sab yahan import)
│   ├── app.controller.ts    ← Hello World route
│   └── app.service.ts       ← Hello World logic
├── test/                    ← Testing files
├── nest-cli.json            ← NestJS CLI config
├── tsconfig.json            ← TypeScript config
├── tsconfig.build.json      ← Build ke liye TS config
├── package.json             ← Dependencies + scripts
└── .eslintrc.js             ← Linting config
```

**Express analogy:**  
Express mein manually `package.json`, `app.js`, `routes/` folder etc banane padte the.

---

### Step 1.3 — Understand generated files (Beginner-friendly)

#### `src/main.ts` — Entry Point

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3000)
}
void bootstrap()
```

**Express analogy:**
```js
const app = express()
app.listen(3000)
```

**Kyun?**  
`NestFactory.create(AppModule)` — NestJS ko batata hai ki "root module yeh hai". NestJS recursively saare modules, controllers, services ko resolve karega.

**`void bootstrap()`** — `bootstrap()` ek Promise return karta hai. `void` ka matlab: "JavaScript, warning mat de — hum intentionally await nahi kar rahe top-level par."

---

#### `src/app.module.ts` — Root Module

```ts
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Express analogy:** Kuch nahi. Express mein aisa koi concept nahi tha.

**Kyun?**  
`@Module({})` ek logical boundary banata hai. AppModule root module hai — yahan saare modules import hote hain.

- `imports` — Doosre modules yahan aate hain (jaise UsersModule, AuthModule)
- `controllers` — Routes yahan register hote hain
- `providers` — Services yahan register hote hain

---

#### `src/app.controller.ts` — Hello World Route

```ts
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
```

**Express analogy:**
```js
app.get('/', (req, res) => {
  res.send('Hello World!')
})
```

**Dhyan do:** Controller constructor mein `AppService` inject ho raha hai. NestJS auto create karega service ka instance — Express mein khud `new AppService()` karna padta.

---

#### `src/app.service.ts` — Business Logic

```ts
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }
}
```

**Express analogy:** Route mein hi likhte the logic. NestJS mein service alag file mein.

---

#### Other important files

| File | Kya hai? |
|---|---|
| `nest-cli.json` | NestJS CLI settings. Language, source folder, etc. |
| `tsconfig.json` | TypeScript settings. Target version, module system, etc. |
| `package.json` | Dependencies list + scripts (`start:dev`, `build`, etc.) |

---

### Step 1.4 — Run the project first time

**Command:**
```bash
npm run start:dev
```

**Kyun?**  
`start:dev` watch mode mein chalega. Matlab — file change karo to server auto restart ho jayega. Development ke liye perfect.

**Kya hoga?**  
Terminal dikhayega: `[NestApplication] Nest application successfully started`  
Browser mein: `http://localhost:3000` → "Hello World!"

**Test:**
```bash
curl http://localhost:3000
# → Hello World!
```

**Express analogy:**  
`npm run start:dev` ≈ `nodemon app.js` (auto restart).

---

## Phase 2: Environment & Config Setup

> **Goal:** `.env` file se PORT, DATABASE_URL, JWT_SECRET load karna

---

### Step 2.1 — Install @nestjs/config

**Command:**
```bash
npm install @nestjs/config
```

**Kyun?**  
NestJS mein `.env` file padhne ke liye `@nestjs/config` package chahiye. Express mein `dotenv` use karte the — yeh ussi ka NestJS wrapper hai.

**Kya hoga?**  
`ConfigModule.forRoot()` ko app.module.ts mein import karoge → `.env` file auto load hogi → `process.env.PORT` access kar sakoge.

**Express analogy:**
```js
// Express
require('dotenv').config()
const port = process.env.PORT || 3000
```

---

### Step 2.2 — Create .env file

**File:** `.env` (project root mein — src ke andar nahi)

**Content:**
```env
PORT=3001
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/nest_app_test_db
JWT_SECRET=my_super_secret_key_2026
```

**Kyun?**  
Hard-coded values galat practice hai. Har developer ka environment alag hota hai. `.env` ko `.gitignore` mein daalo — secrets leak nahi honge.

**.env.example** bana lo (template ke liye — yeh git mein commit ho sakta hai):
```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/database_name
JWT_SECRET=your_secret_key_here
```

**Kya hoga?**  
`ConfigModule` `.env` file read karega → `process.env.PORT` = "3001", etc.

---

### Step 2.3 — Update app.module.ts with ConfigModule

**File:** `src/app.module.ts`

```ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**`isGlobal: true` kyun?**  
Express mein `dotenv.config()` ek baar call karo → sab jagah `process.env` available. `isGlobal: true` same kaam karta hai — har module mein ConfigModule import nahi karna padega.

**Kya hoga?**  
Ab saari files mein `process.env.PORT` directly use kar sakte ho. AppModule se pehle `.env` file gaayab thi — isliye PORT 3001 nahi padh raha tha server mein.

---

## Phase 3: PostgreSQL + Drizzle ORM Setup

> **Goal:** Database connection establish karo + tables create karo

---

### Step 3.1 — Install Drizzle packages

**Commands:**
```bash
npm install drizzle-orm pg
npm install -D @types/pg drizzle-kit
```

**Kyun?**  
- `drizzle-orm` — TypeScript ORM. Express mein directly SQL likhte the. Drizzle type safety deta hai.
- `pg` — PostgreSQL client. Database se connect hone ke liye.
- `@types/pg` — TypeScript ke liye pg ke types.
- `drizzle-kit` — CLI tool. Schema se SQL generate karta hai.

**Kya hoga?**  
Dependencies install ho jayengi.

---

### Step 3.2 — Create DatabaseModule (with @Global)

**File:** `src/db/database.module.ts`

```ts
import { Global, Module } from '@nestjs/common'
import { DatabaseService } from './database.service'

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

**`@Global()` kyun?**  
Express mein ek baar pool banao → `require('./db')` karke sab jagah use karte the. `@Global()` same kaam karta hai — kisi bhi module mein directly `DatabaseService` inject kar sakte ho bina import kiye.

**`exports: [DatabaseService]` kyun?**  
Service ko doosre modules ke liye available banata hai. Na bhi likho to bhi chalega kyunki `@Global()` hai. Lekin best practice hai.

**Kya hoga?**  
DatabaseModule ko `app.module.ts` imports mein daalo → saari services `DatabaseService` use kar sakengi.

---

### Step 3.3 — Create DatabaseService

**File:** `src/db/database.service.ts`

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool
  private dbInstance!: ReturnType<typeof drizzle<typeof schema>>

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in .env file')
    }

    // Auto-create database if not exists
    const dbNameMatch = connectionString.match(/\/([^/]+)$/)
    if (dbNameMatch) {
      const dbName = dbNameMatch[1]
      const baseUrl = connectionString.replace(`/${dbName}`, '/postgres')
      const tempPool = new Pool({ connectionString: baseUrl })
      try {
        const result = await tempPool.query(
          `SELECT 1 FROM pg_database WHERE datname = $1`,
          [dbName],
        )
        if (result.rowCount === 0) {
          await tempPool.query(`CREATE DATABASE "${dbName}"`)
          console.log(`✅ Database "${dbName}" created successfully`)
        }
      } finally {
        await tempPool.end()
      }
    }

    this.pool = new Pool({ connectionString })
    this.dbInstance = drizzle(this.pool, { schema })
    console.log('✅ Database connected successfully')
  }

  get db() {
    return this.dbInstance
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end()
      console.log('🔌 Database connection closed')
    }
  }
}
```

**Kyun?**  
- `OnModuleInit` — App start hote hi database connection establish ho jaye. Express mein `app.listen` se pehle pool create karte the.
- `OnModuleDestroy` — App band hote hi pool close. Resources leak nahi hoga.
- `private pool!: Pool` — `!` ka matlab: "TypeScript, yeh runtime mein initialize hoga, error mat do"
- Auto-create DB — check karo database exists ya nahi. Nahi to CREATE DATABASE.

**Kya hoga?**  
App start hoti hi PostgreSQL connection ready. `DatabaseService.db` se Drizzle queries use kar sakte ho.

---

### Step 3.4 — Create drizzle.config.ts

**File:** `drizzle.config.ts` (project root mein)

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./src/users/schema.ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Kyun?**  
`drizzle-kit` ko batana padta hai: "Schema file kahan hai?" + "Database ka URL kya hai?" + "PostgreSQL use kar rahe ho?"

**Kya hoga?**  
`npx drizzle-kit push` run karoge to schema padhke DB mein tables bana dega.

---

### Step 3.5 — Push schema to database (create tables)

**Command:**
```bash
npx drizzle-kit push
```

**Before this:** Ensure PostgreSQL chal raha hai (local ya Docker mein).

**Kyun?**  
Schema file mein table definition likhi hai. `push` command SQL mein convert karke DB mein apply karti hai.

**Kya hoga?**  
PostgreSQL mein table create ho jayega. Check karo:
```bash
psql -U postgres -d nest_app_test_db -c "\dt"
```

---

### Step 3.6 — Add DatabaseModule to app.module.ts

**File:** `src/app.module.ts` mein imports array mein add karo:

```ts
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  DatabaseModule,
],
```

**Kyun?**  
Module ko root module mein import karna padta hai tabhi NestJS uske baare mein jaanta hai. `@Global()` se provider globally available ho jata hai, lekin module khud app.module.ts mein import hona chahiye.

---

## Phase 4: Module-wise Schema Pattern

> **Goal:** Table definition users module mein rakho, db/schema sirf re-export kare

---

### Step 4.1 — Create UsersModule

**Command:**
```bash
nest g mo users
```

**Kyun?**  
`nest g mo` (generate module) — CLI se module banate ho. `src/users/` folder create hoga + `users.module.ts` file. AppModule mein auto-import ho jayega.

**Kya hoga?**
```
src/users/
  users.module.ts
```

---

### Step 4.2 — Create Users Table Schema

**File:** `src/users/schema.ts`

```ts
import { pgTable, pgEnum, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['student', 'admin'])

export const users = pgTable('users', {
  id:        serial('id').primaryKey(),
  fname:     text('fname').notNull(),
  lname:     text('lname').notNull(),
  email:     text('email').notNull(),
  password:  text('password').notNull(),
  role:      userRoleEnum('role').notNull().default('student'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_unique_idx').on(table.email),
}))
```

**Kyun?**  
- `pgEnum` — PostgreSQL ka ENUM type. DB-level validation: sirf 'student' ya 'admin' allow.
- `serial('id')` — Auto-increment integer. Express mein `SERIAL PRIMARY KEY` jaisa.
- `text('fname').notNull()` — Required string field.
- `timestamptz` — Timezone-aware timestamp. Best practice.
- `uniqueIndex` — Email duplicate nahi ho sakta. Express mein `UNIQUE CONSTRAINT`.
- `defaultNow()` — Auto set current timestamp.

**Express analogy:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  fname TEXT NOT NULL,
  ...
);
```

**Kya hoga?**  
Drizzle auto-generates types:
```ts
type User = typeof users.$inferSelect      // SELECT se milne wali type
type NewUser = typeof users.$inferInsert   // INSERT ke liye required fields
```

---

### Step 4.3 — Create Barrel Re-export

**File:** `src/db/schema.ts`

```ts
export * from '../users/schema'
```

**Kyun?**  
`DatabaseService` ko schema import karna hai. Agar directly `../users/schema` import karega to tight coupling ho jayegi. Barrel export = ek central point se saari schemas import kar sakte ho.

Future mein jab `products/` module banega, to uski schema bhi yahan export karoge. `DatabaseService` kuch nahi badlega.

**Kya hoga?**  
`DatabaseService` mein `import * as schema from './schema'` kaam karega.

---

## Phase 5: Validation Pipeline (GlobalValidationPipe)

> **Goal:** Har request body auto-validate ho, extra fields reject ho

---

### Step 5.1 — Install class-validator + class-transformer

**Command:**
```bash
npm install class-validator class-transformer
```

**Kyun?**  
- `class-validator` — Decorators deta hai: `@IsEmail()`, `@IsString()`, `@IsNotEmpty()`, `@IsEnum()`
- `class-transformer` — Request body ko plain object se class instance mein convert karta hai (taaki validation decorators trigger ho)

Express mein manual if-else checks karte the: `if (!email) return res.status(400)...` Ab decorators se auto ho jayega.

---

### Step 5.2 — Configure ValidationPipe in main.ts

**File:** `src/main.ts`

```ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // Extra fields auto hatao
    forbidNonWhitelisted: true,   // Extra fields pe error do
    transform: true,              // "1" → 1, "true" → true auto convert
  }))

  await app.listen(process.env.PORT ?? 3000)
}
void bootstrap()
```

**Kyun?**  

**`whitelist: true`** — Agar koi `isAdmin: true` bhejega to woh field auto remove ho jayegi. Express mein manually `delete req.body.isAdmin` karna padta.

**`forbidNonWhitelisted: true`** — Extra field bheja to 400 error. Security ke liye important.

**`transform: true`** — URL params string aate hain. `@Param('id', ParseIntPipe) id: number` — string "5" ko number 5 mein.

**Express analogy:**
```js
// Express manual validation
const { fname, lname, email } = req.body
if (!fname || !email) return res.status(400).json({ error: 'Missing fields' })
delete req.body.isAdmin  // Extra field hatao
```

**Kya hoga?**  
Agar body invalid hai → 400 Bad Request + error messages ki array. Controller ka code clean rahega.

### ⭐ VERY IMPORTANT — ValidationPipe ke bina decorators kaam nahi karte

Agar `useGlobalPipes(ValidationPipe(...))` nahi likha to `@IsEmail()`, `@IsString()` sab inert rahenge. Controller mein koi bhi data aa jayega bina validation ke.

---

## Phase 6: Global Exception Filter

> **Goal:** Server crash na ho — har error catch kare + proper JSON response

---

### Step 6.1 — Create folder and filter file

**Command:**
```bash
mkdir src/common
mkdir src/common/filters
```

**File:** `src/common/filters/global-exception.filter.ts`

```ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const res = exception.getResponse()
      response.status(status).json(res)
      return
    }

    console.error('❌ Unexpected error:', exception)

    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
}
```

**Kyun?**  
- `HttpException` ki subclasses: `NotFoundException` (404), `ConflictException` (409), `UnauthorizedException` (401) — NestJS inhe auto handle karta hai. Bas pass through karo.
- `unknown` errors: Koi bhi unexpected crash (DB down, null pointer, etc.) — log karo + 500 bhejo.

**Express analogy:**
```js
app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json(err)
  }
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})
```

---

### Step 6.2 — Register filter in app.module.ts

**File:** `src/app.module.ts`

```ts
import { APP_FILTER } from '@nestjs/core'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

@Module({
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
```

**Kyun?**  
Express error middleware ko `app.use()` se register karte the. NestJS mein `APP_FILTER` token se global banate hain — har controller ke liye applicable.

**Kya hoga?**  
Project mein kahin bhi error throw hoga → GlobalExceptionFilter catch karega → proper response.

---

## Phase 7: DTOs (Data Transfer Objects)

> **Goal:** Request body validate kare — pehle hi galat data reject ho

---

### Step 7.1 — Create User DTOs folder

**Command:**
```bash
mkdir src/users/dto
```

**Files:**
```
src/users/dto/
├── create-user.dto.ts
└── index.ts    ← Barrel export
```

---

### Step 7.2 — CreateUserDto

**File:** `src/users/dto/create-user.dto.ts`

```ts
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator'

export enum UserRole {
  student = 'student',
  admin = 'admin',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fname!: string

  @IsString()
  @IsNotEmpty()
  lname!: string

  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsNotEmpty()
  password!: string

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole
}
```

**Kyun?**  
- `@IsString()` — Jo aaya woh string hona chahiye. Number aaya to 400 error.
- `@IsNotEmpty()` — Empty string reject karo. `fname: ""` → error.
- `@IsEmail()` — Email format valid hona chahiye. `rahul` → error, `rahul@test.com` → pass.
- `@IsEnum(UserRole)` — Sirf 'student' ya 'admin' allow. `manager` → error.
- `fname!: string` — `!` ka matlab: "NestJS runtime mein value set karega, error mat do."

**Express mein:**
```js
if (!fname || typeof fname !== 'string') return res.status(400).json({ error: 'Invalid fname' })
```

---

### Step 7.3 — Auth DTOs (independent classes)

**File:** `src/auth/dto/register.dto.ts`

```ts
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { UserRole } from '../../users/dto/create-user.dto'

export class RegisterDto {
  @IsString() @IsNotEmpty() fname!: string
  @IsString() @IsNotEmpty() lname!: string
  @IsEmail()  @IsNotEmpty() email!: string
  @IsString() @IsNotEmpty() password!: string
  @IsEnum(UserRole) @IsNotEmpty() role!: UserRole
}
```

**File:** `src/auth/dto/login.dto.ts`

```ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @IsEmail()    @IsNotEmpty() email!: string
  @IsString()   @IsNotEmpty() password!: string
}
```

**File:** `src/auth/dto/index.ts`

```ts
export * from './register.dto'
export * from './login.dto'
```

**Kyun independent DTOs? (SRP — Single Responsibility Principle)**

- `RegisterDto` — Registration form. Future mein `phone`, `referralCode` add ho sakta hai.
- `CreateUserDto` — Database mein user create karne ke liye. Yeh stable rehna chahiye.

Agar dono same hote, to RegisterDto badla to CreateUserDto bhi badal jata → UsersService effect hota.

**Express mein:** Ek hi object use karte the. Change kiya to saari jagah change hota.

---

## Phase 8: UsersService — The Data Owner

> **Goal:** Saari user-related DB logic ek hi jagah (Single Source of Truth)

---

### Step 8.1 — Generate UsersService

**Command:**
```bash
nest g s users --no-spec
```

**File:** `src/users/users.service.ts`

**Kyun?**  
CLI se service generate karo. `@Injectable()` decorator + `UsersModule` providers mein auto-add hoga.

---

### Step 8.2 — create() method

```ts
async create(dto: CreateUserDto) {
  try {
    // 1. Email duplicate check
    const existing = await this.database.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1)

    if (existing.length > 0) {
      throw new ConflictException('Email already exists')
    }

    // 2. Password hash
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 3. DB INSERT
    const [created] = await this.database.db
      .insert(users)
      .values({
        fname: dto.fname,
        lname: dto.lname,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      })
      .returning()

    return created
  } catch (error: unknown) {
    if (error instanceof ConflictException || error instanceof NotFoundException) {
      throw error
    }
    throw new InternalServerErrorException('Failed to create user')
  }
}
```

**Kyun?**  
- Pehle check karo ki email already exists ya nahi — duplicate nahi hone dena.
- `bcrypt.hash(password, 10)` — password ko hash karo. `10` = salt rounds. ~100ms lagta hai.
- Express mein: `INSERT INTO users (...) VALUES (...) RETURNING *`

---

### Step 8.3 — findByEmail() method

```ts
async findByEmail(email: string) {
  try {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    return user ?? null
  } catch (error: unknown) {
    throw new InternalServerErrorException('Failed to find user by email')
  }
}
```

**Kyun?**  
Auth login ke liye email se user dhunda hota hai. User mila to return, nahi to `null`.

---

### Step 8.4 — validatePassword() method

```ts
async validatePassword(plainPassword: string, hashedPassword: string) {
  try {
    return bcrypt.compare(plainPassword, hashedPassword)
  } catch {
    throw new InternalServerErrorException('Failed to validate password')
  }
}
```

**Kyun?**  
`bcrypt.compare()` — plain password + hashed password → match? true/false. AuthService login mein ise use karegi.

---

### Step 8.5 — findOne() method

```ts
async findOne(id: number) {
  try {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return user
  } catch (error: unknown) {
    if (error instanceof NotFoundException) {
      throw error
    }
    throw new InternalServerErrorException('Failed to find user')
  }
}
```

**Kyun?**  
`SELECT * FROM users WHERE id = $1`. User nahi mila → `NotFoundException(404)`.

**Express analogy:**
```js
const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
```

---

### Step 8.6 — profile() method

```ts
async profile(userId: number) {
  const user = await this.findOne(userId)
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
```

**Kyun?**  
Logged-in user ka data chahiye (bina password ke). `this.findOne()` ko reuse karo + password strip karo. **DRY principle** — Do baar same code nahi likhna.

**Kya hoga?**  
User object without password.

---

## Phase 9: UsersController — Routes

> **Goal:** Har route ke liye endpoint define karo

---

### Step 9.1 — Generate UsersController

**Command:**
```bash
nest g co users --no-spec
```

**File:** `src/users/users.controller.ts`

---

### Step 9.2 — Only profile endpoint (route-wise)

```ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AuthGuard } from '../auth/auth.guard'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  profile(@Req() req: Request) {
    return this.usersService.profile(req.user!.id)
  }
}
```

**Kyun sirf profile?**  
- UsersController ka kaam sirf logged-in user ko apna data dikhana hai
- Registration/login ka kaam AuthController karega
- `@UseGuards(AuthGuard)` — NestJS Guard hai. Sirf is ek route pe laga hai. Baaki routes open rahenge

**`@UseGuards(AuthGuard)` kyun, middleware nahi?**  
- Middleware = Global level (AppModule mein apply hota hai, saare routes pe jaata hai)
- Guard = Route level (sirf us route pe laga hai jahan `@UseGuards()` likha ho)
- **Rule of thumb:** Agar sirf kuch specific routes protect karne hain → Guard use karo. Agar saare routes protect karne hain → Middleware use karo.

---

## Phase 10: Auth Module + JWT Authentication

> **Goal:** Register/Local — token return karo

---

### Step 10.1 — Generate Auth Module + Controller + Service

**Commands:**
```bash
nest g mo auth
nest g co auth --no-spec
nest g s auth --no-spec
```

**Files:**
```
src/auth/
├── auth.module.ts
├── auth.controller.ts
└── auth.service.ts
```

---

### Step 10.2 — Install JWT Package

**Command:**
```bash
npm install @nestjs/jwt
```

**Kyun?**  
`@nestjs/jwt` — NestJS ka official JWT wrapper. `sign()` + `verify()` methods provide karta hai.

**Express analogy:**
```js
const jwt = require('jsonwebtoken')
const token = jwt.sign({ id: user.id }, SECRET)
const decoded = jwt.verify(token, SECRET)
```

---

### Step 10.3 — Create JWT Payload Interface

**File:** `src/auth/jwt-payload.interface.ts`

```ts
export interface JwtPayload {
  id: number
}
```

**Kyun?**  
TypeScript type safety. JWT decode kiya → `{ id: number }` milna chahiye. Interface define karo taaki `req.user` ka type pata ho.

---

### Step 10.4 — Create Auth DTOs folder

```bash
mkdir src/auth/dto
```

Files: `register.dto.ts`, `login.dto.ts`, `index.ts` — already Phase 7.3 mein bana diye.

---

### Step 10.5 — Configure JwtModule in auth.module.ts

**File:** `src/auth/auth.module.ts`

```ts
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthGuard } from './auth.guard'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
```

**`global: true` kyun?**  
`AuthGuard` ya koi bhi service `JwtService` ko inject kar sake bina import kiye. Agar global na ho to har module mein `JwtModule` import karna padega.

**Kya hoga?**  
Kahi bhi `jwtService` inject kar sakte ho.

---

### Step 10.6 — Create AuthGuard (instead of Middleware)

**File:** `src/auth/auth.guard.ts`

```ts
import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>()
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is required')
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded = this.jwtService.verify<{ id: number }>(token)
      req.user = decoded
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
```

**Guard vs Middleware — kya fark hai?**

| Feature | Middleware | Guard |
|---------|-----------|-------|
| **Level** | App-wide (`.forRoutes()`) | Route-specific (`@UseGuards()`) |
| **Kaise lagta hai** | `AppModule.configure()` mein | Controller ke route handler par decorator se |
| **Kis route pe lagega?** | Saare ya exclude wale | Sirf jahan `@UseGuards()` likha |
| **Use case** | Sab jagah auth chahiye (admin panel) | Sirf kuch specific routes protected |

**Express analogy:**
```js
// Middleware (sab routes pe)
app.use(authMiddleware)

// Guard jaisa (specific route pe)
router.get('/profile', authMiddleware, handler)
```

**Kyun Guard use kiya middleware ki jagah?**  
Hume sirf `GET /users/profile` ko protect karna hai. Middleware global hota hai — exclude karte karte complexity badhti hai. Guard route-specific hai — jahan lagao wahi kaam karta hai.

**`req.user` ka type?**  
`auth.guard.ts` mein `jwtService.verify<{ id: number }>(token)` — decoded token ka type. `src/types/express-augment.ts` mein Express.Request mein `user` property add ki gayi hai taaki TypeScript error na de.

---

### Step 10.7 — Express Type Augmentation

**File:** `src/types/express-augment.ts`

```ts
declare global {
  namespace Express {
    interface Request {
      user?: { id: number }
    }
  }
}

export {}
```

**Kyun?**  
TypeScript error dega: `Property 'user' does not exist on type 'Request'`. Express ke types mein `user` property nahi hai. Is file se TypeScript ko batate hain ki "haan, user property exist karti hai".

**Express mein:** Plain JS mein koi type issue nahi tha. TypeScript mein augmentation zaroori hai.

---

### Step 10.8 — Implement AuthService

**File:** `src/auth/auth.service.ts`

```ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { CreateUserDto } from '../users/dto/create-user.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const createUserDto = new CreateUserDto()
      createUserDto.fname = dto.fname
      createUserDto.lname = dto.lname
      createUserDto.email = dto.email
      createUserDto.password = dto.password
      createUserDto.role = dto.role

      const user = await this.usersService.create(createUserDto)
      const token = this.jwtService.sign({ id: user.id })

      const { password: _, ...userWithoutPassword } = user
      return { user: userWithoutPassword, token }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Registration failed')
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(dto.email)

      if (!user) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const isPasswordValid = await this.usersService.validatePassword(
        dto.password,
        user.password,
      )

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const token = this.jwtService.sign({ id: user.id })

      const { password: _, ...userWithoutPassword } = user
      return { user: userWithoutPassword, token }
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new InternalServerErrorException('Login failed')
    }
  }
}
```

**Kyun password destructure?**  
DB mein password store hai. User ko wapas bhejna nahi chahiye. `const { password: _, ...rest } = user` — password `_` variable mein chala gaya, `rest` mein baaki sab.

---

### Step 10.9 — Implement AuthController

**File:** `src/auth/auth.controller.ts`

```ts
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }
}
```

**`@HttpCode(HttpStatus.OK)` kyun?**  
POST ka default status code 201 (Created) hota hai. Login ke liye 200 (OK) chahiye.

**Express analogy:**
```js
app.post('/auth/login', async (req, res) => {
  res.status(200).json({ user, token })
})
```

---

## Phase 11: Route-wise AuthGuard Application

> **Goal:** Sirf `GET /users/profile` route protected ho — baaki sab open. Guard lagao, middleware nahi.

---

### Step 11.1 — Apply AuthGuard on specific route

Global middleware ki jagah hum **route-specific Guard** use karte hain.

**File:** `src/users/users.controller.ts`

```ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AuthGuard } from '../auth/auth.guard'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard)        // ✅ Sirf yeh route protected
  profile(@Req() req: Request) {
    return this.usersService.profile(req.user!.id)
  }
}
```

**`@UseGuards(AuthGuard)` kaise kaam karta hai?**  
- Guard ek class hai jo `CanActivate` interface implement karta hai
- `canActivate()` → `true` return kiya to request proceed, `false` / exception throw → 401
- `@UseGuards()` decorator route handler ke upar laga → sirf us route ke liye guard active

**Kyun middleware nahi?**  
- Middleware `AppModule` mein `configure()` se global apply hota hai
- Middleware ko exclude karna padta hai (register, login)
- Middleware bhoolna aasan hai — Guard explicit hai (decorator route ke saath)
- **Rule:** 1-2 routes protect karne hain → Guard. Sab routes protect karne hain → Middleware.

**Express analogy:**
```js
// Guard approach (route-specific)
router.get('/profile', authMiddleware, handler)
// Sirf /profile pe authMiddlerware laga, /users/:id pe nahi
```

**Kya hoga?**  
`app.module.ts` ab simple hai — koi middleware nahi, koi `configure()` nahi:

```ts
import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { DatabaseModule } from './db/database.module'
import { UsersModule } from './users/users.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
```

---

### Step 11.2 — What gets protected?

| Route | Protected? | Reason |
|---|---|---|
| `POST /auth/register` | ❌ No | AuthController — no Guard |
| `POST /auth/login` | ❌ No | AuthController — no Guard |
| `GET /users/profile` | ✅ Yes | `@UseGuards(AuthGuard)` on controller method |
| `GET /` (Hello World) | ❌ No | AppController — no Guard |

---

## Phase 12: Profile Moved to Users Module

> **Goal:** Auth module sirf register/login handle kare, profile users module mein

---

### Step 12.1 — Already done

- `@Get('profile')` in UsersController with `@UseGuards(AuthGuard)` ✅ (Phase 9.2)
- `profile()` in UsersService ✅ (Phase 8.6)

### Step 12.2 — Cleanup Auth Module

**Remove profile endpoint from AuthController** — Already removed in Phase 10.9.

**Remove profile() from AuthService** — Already removed in Phase 10.8.

### Current architecture:

```
AuthModule                    UsersModule
───────────                   ───────────
register()  ──delegates──▶    create()
login()     ──delegates──▶    findByEmail() + validatePassword()
                               findOne() + profile()
```

**Benefits:**
- AuthModule: Only authentication (register + login + JWT)
- UsersModule: Only profile (logged-in user ka apna data)
- **SRP** — ek module ek kaam

---

## Phase 13: Build & Verify

> **Goal:** Zero errors, all endpoints working

---

### Step 13.1 — Build project

**Command:**
```bash
npm run build
```

**Kyun?**  
NestJS build → TypeScript compile → JavaScript output. Errors agar hain to yahi pata chalenge.

**Expected:** Zero errors.  
**If error:** Fix karo. Common error: `import type { Request } from 'express'` nahi likha to `emitDecoratorMetadata` ka error aa sakta hai.

---

### Step 13.2 — Push schema to database

**Command:**
```bash
npx drizzle-kit push
```

**Kyun?**  
`drizzle.config.ts` mein schema path diya hai. Drizzle `CREATE TABLE` generate karega aur PostgreSQL mein run karega.

**Before:** Ensure PostgreSQL chal raha hai.

---

### Step 13.3 — Start server

**Command:**
```bash
npm run start:dev
```

**Expected:**
```
✅ Database "nest_app_test_db" created successfully
✅ Database connected successfully
[NestApplication] Nest application successfully started
```

---

### Step 13.4 — Test all endpoints

**1. Register**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fname":"Rahul","lname":"Sharma","email":"rahul@test.com","password":"secret123","role":"student"}'
```

**Expected (201):**
```json
{
  "user": { "id": 1, "fname": "Rahul", "lname": "Sharma", "email": "rahul@test.com", "role": "student" },
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0..."
}
```
> ✅ Password response mein nahi hai

---

**2. Login**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul@test.com","password":"secret123"}'
```

**Expected (200):**
```json
{
  "user": { "id": 1, "fname": "Rahul", ... },
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0..."
}
```

**Wrong password test (401):**
```json
{ "message": "Invalid credentials", "error": "Unauthorized", "statusCode": 401 }
```

---

**3. Profile (with token)**
```bash
curl http://localhost:3001/users/profile \
  -H "Authorization: Bearer <token-from-login>"
```

**Expected (200):**
```json
{
  "id": 1,
  "fname": "Rahul",
  "lname": "Sharma",
  "email": "rahul@test.com",
  "role": "student",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

> ✅ No password, no token. Sirf user data. ID URL mein nahi deni padi — token se aayi.

**Without token (401):**
```json
{ "message": "Token is required", "error": "Unauthorized", "statusCode": 401 }
```

---

**4. Validation test (error case)**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}'
```

**Expected (400):**
```json
{
  "message": ["email must be an email", "fname should not be empty", "lname should not be empty", "password should not be empty", "role should not be empty"],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Phase 14: Architecture & File Map Reference

> **Goal:** Project ka mental map

---

### 14.1 Complete File Map

```
my_first_project/
│
├── src/                           # Saara code yahan
│   │
│   ├── main.ts                    # ⭐ Entry — ValidationPipe + server start
│   ├── app.module.ts              # ⭐ Root — module imports, global filter
│   ├── app.controller.ts          # Hello World (GET /)
│   ├── app.service.ts             # Hello World logic
│   │
│   ├── types/                     # 📝 Type augmentations
│   │   └── express-augment.ts     #   req.user type definition
│   │
│   ├── db/                        # 🗄️ Database (GLOBAL)
│   │   ├── database.module.ts     #   @Global()
│   │   ├── database.service.ts    #   Pool + Drizzle + auto-create DB
│   │   └── schema.ts              #   Barrel re-export
│   │
│   ├── users/                     # 👤 Users module
│   │   ├── users.module.ts        #   exports UsersService
│   │   ├── users.controller.ts    #   GET /users/profile (protected by AuthGuard)
│   │   ├── users.service.ts       #   create, findByEmail, validatePassword, findOne, profile
│   │   ├── schema.ts              #   Users table definition
│   │   └── dto/
│   │       └── create-user.dto.ts #   @IsEmail @IsString @IsNotEmpty @IsEnum
│   │
│   ├── auth/                      # 🔐 Auth module
│   │   ├── auth.module.ts         #   JwtModule global + imports UsersModule
│   │   ├── auth.controller.ts     #   POST /auth/register, POST /auth/login
│   │   ├── auth.service.ts        #   register + login (delegates to UsersService)
│   │   ├── auth.guard.ts          #   JWT verify — Bearer token check (route-specific!)
│   │   ├── jwt-payload.interface.ts  # { id: number }
│   │   └── dto/
│   │       ├── register.dto.ts    #   Registration fields (independent!)
│   │       ├── login.dto.ts       #   email + password
│   │       └── index.ts           #   Barrel export
│   │
│   ├── common/                    # 🛠️ Shared utilities
│   │   └── filters/
│   │       └── global-exception.filter.ts  # Global error handler
│
├── drizzle.config.ts              # Drizzle kit config
├── nest-cli.json                  # NestJS CLI config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies + scripts
├── .env                           # Environment variables (git-ignored)
├── .env.example                   # Template for .env (git-committed)
├── README.md                      # Documentation
└── info.md                        # This recipe file
```

---

### 14.2 Module Dependency Diagram

```
AppModule
   │
   ├── ConfigModule.forRoot()
   │     └── .env file load → process.env
   │
   ├── DatabaseModule (@Global)
   │     └── DatabaseService (pool + drizzle)
   │           ↑ Injected into UsersService
   │
   ├── UsersModule
   │     ├── UsersController (route: GET /users/profile)
   │     │     └── @UseGuards(AuthGuard) → route-specific protection
   │     ├── UsersService (business logic)
   │     │     └── uses DatabaseService
   │     └── exports: [UsersService]
   │           ↑ Used by AuthService
   │
   ├── AuthModule
   │     ├── JwtModule (global, secret from .env)
   │     ├── UsersModule (imported for UsersService)
   │     ├── AuthController (register + login routes)
   │     ├── AuthService (uses UsersService + JwtService)
   │     └── AuthGuard (uses JwtService)
   │           ↑ Used via @UseGuards() on UsersController.profile()
   │
   └── GlobalExceptionFilter (via APP_FILTER provider)
```

---

### 14.3 Complete Request Flow — Profile Example

```
GET /users/profile
Authorization: Bearer eyJhbG...
  │
  ▼
[AuthGuard.canActivate()]  ← @UseGuards(AuthGuard) ne trigger kiya
  ├── Header se "Bearer eyJhbG..." extract
  ├── jwtService.verify(token) → { id: 1, iat: 1748640000 }
  ├── req.user = { id: 1 }
  └── return true → controller ko request chali gayi
  │
  ▼
[UsersController.profile(@Req() req)]
  └── req.user!.id = 1
  │
  ▼
[UsersService.profile(1)]
  ├── this.findOne(1) called
  │     └── DB: SELECT * FROM users WHERE id = 1
  │     └── User found → { id:1, fname:"Rahul", password:"$2b$10$...", ... }
  ├── const { password: _, ...userWithoutPassword } = user
  └── return { id:1, fname:"Rahul", ... }  (no password)
  │
  ▼
Response: 200 OK
{ "id":1, "fname":"Rahul", "email":"rahul@test.com", "role":"student", ... }
```

---

### 14.4 Complete Request Flow — Register Example

```
POST /auth/register
{ "fname":"Rahul", "lname":"Sharma", "email":"rahul@test.com", "password":"secret123", "role":"student" }
  │
  ├─ [ValidationPipe] → @IsEmail() ✓ @IsString() ✓ @IsNotEmpty() ✓ @IsEnum() ✓
  │                     → Extra fields? whitelist remove → OK
  │                     → Invalid? → 400 Bad Request
  │
  ├─ [AuthController.register(dto)]
  │     → AuthService.register(dto) ko call
  │
  ├─ [AuthService.register(dto)]
  │     a. RegisterDto → CreateUserDto fields map
  │     b. UsersService.create(createUserDto) ko call
  │     c. JWT sign: jwtService.sign({ id: user.id })
  │     d. Password exclude: { password: _, ...rest }
  │     e. Return: { user: rest, token }
  │
  ├─ [UsersService.create(dto)]
  │     a. Email duplicate check → ConflictException(409) if exists
  │     b. bcrypt.hash(password, 10)
  │     c. DB INSERT INTO users (...) VALUES (...) RETURNING *
  │     d. Return created user
  │
  └─ Response: 201 Created
     { "user": { "id":1, "fname":"Rahul", ... }, "token": "eyJ..." }
```

---

### 14.5 Key Design Decisions

| Decision | Reason |
|---|---|
| `@Global()` on DatabaseModule | Har module mein import nahi karna pade |
| Module-wise schema (`users/schema.ts`) | Har module apni table definition khud rakhe — SRP |
| Barrel re-export (`db/schema.ts`) | DatabaseService ko ek central import point |
| `ValidationPipe` with whitelist + forbidNonWhitelisted | Extra fields (isAdmin) auto reject — security |
| Two DTOs (RegisterDto vs CreateUserDto) | RegisterDto future mein badh sakta hai (phone, referralCode) |
| AuthService delegates to UsersService | DB access ka single source of truth — DRY |
| Route-wise AuthGuard (`@UseGuards`) instead of global middleware | Sirf wahi routes protect jo actually chahiye — baaki open |
| No JWT expiry | User specifically asked |
| `global: true` on JwtModule | AuthGuard kahi bhi JwtService inject kar sake |
| Password destructuring | Security — user password DB ke bahar kabhi nahi aana chahiye |
| `try-catch (error: unknown)` in every service method | Har method individually errors handle kare — Global filter just backup |

---

## Bonus 1: .env.example

**File:** `.env.example` (project root mein — yeh git mein commit ho sakta hai)

```env
# =====================
# Server Configuration
# =====================

PORT=3001

# =====================
# Database Configuration
# =====================
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL=postgresql://postgres:12345678@localhost:5432/nest_app_test_db

# =====================
# JWT Configuration
# =====================
JWT_SECRET=my_super_secret_key_2026
```

**.env.example kyun?**
- Naya developer join kare to use pata chalega ki kaunse env variables chahiye.
- GitHub pe commit ho sakta hai (`.env` nahi hota — `.gitignore` mein daalo).
- Real `.env` file banao to `.env.example` copy karo.

**`.gitignore` mein ensure karo:**
```
.env
```

---

## Bonus 2: Known Issues & Fixes

---

### Issue 1: drizzle-kit push fails with ES2023

**Error:**
```
✗ Something went wrong, the configuration or schema files are not valid
...Cannot query "target" of undefined...
```

**Reason:**  
Drizzle-kit ko ES2023 target ke saath issue hai. TypeScript config latest target par problem karta hai.

**Fix:**  
Temporarily change `tsconfig.json` target to ES2022:

```json
{
  "compilerOptions": {
    "target": "ES2022",  // ES2023 → ES2022
  }
}
```

After `npx drizzle-kit push` success, revert back to ES2023:

```json
{
  "compilerOptions": {
    "target": "ES2023",  // Wapas ES2023
  }
}
```

---

### Issue 2: "A type referenced in a decorated signature must be imported with 'import type'"

**Error:**
```
TS1272: A type referenced in a decorated signature must be imported with
'import type' or a namespace import when 'isolatedModules' and
'emitDecoratorMetadata' are enabled.
```

**Reason:**  
When you use `@Req() req: Request` and `Request` is imported from `express`, TypeScript requires `import type` because of `emitDecoratorMetadata`.

**Fix:**  
Change import from:
```ts
import { Request } from 'express'
```
To:
```ts
import type { Request } from 'express'
```

Or use a namespace import:
```ts
import * as express from 'express'
// then: @Req() req: express.Request
```

---

### Issue 3: DTO validation doesn't work

**Problem:**  
`@IsEmail()`, `@IsString()` etc decorators ka koi effect nahi. Koi bhi data controller mein aa jata hai.

**Reason:**  
`ValidationPipe` `main.ts` mein register nahi kiya.

**Fix:**  
`main.ts` mein add karo:
```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}))
```

---

### Issue 4: process.env.PORT undefined

**Problem:**  
Server PORT variable nahi padh raha.

**Reason:**  
`ConfigModule.forRoot()` app.module.ts mein import nahi kiya ya `.env` file sahi jagah nahi hai.

**Fix:**  
Check:
1. `ConfigModule.forRoot()` app.module.ts imports mein hai?
2. `.env` file project root mein hai (src ke andar nahi)?
3. `isGlobal: true` set kiya?

---

### Issue 5: AuthGuard throws "Cannot read properties of undefined"

**Problem:**  
`req.user!.id` par error aa raha hai.

**Reason:**  
`@UseGuards(AuthGuard)` route par nahi laga ya Guard mein `req.user = decoded` set karna bhool gaye.

**Fix:**  
Check karo:
1. `@UseGuards(AuthGuard)` profile route handler ke upar hai?
2. Guard mein `req.user = decoded` set kiya hai?
3. `src/types/express-augment.ts` mein `user` property declared hai?

---

## Bonus 3: Common Beginner Mistakes

---

### ❌ Mistake 1: Direct DB access from AuthService

**Galat:**
```ts
@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  async login(email: string) {
    const [user] = await this.database.db  // ❌ DB ko direct chhoot raha hai
      .select().from(users).where(eq(users.email, email))
  }
}
```

**Sahi:**
```ts
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(email: string) {
    const user = await this.usersService.findByEmail(email)  // ✅ Delegate
  }
}
```

**Kyun?** — Code duplicate nahi hona chahiye. UsersService single source of truth hai user data ke liye.

---

### ❌ Mistake 2: Business logic in Controller

**Galat:**
```ts
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10)  // ❌ Logic yahan nahi
    // ...
  }
}
```

**Sahi:**
```ts
@Controller('users')
export class UsersController {
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)  // ✅ Sirf delegate
  }
}
```

**Kyun?** — Controller sirf route handle kare. Service mein logic rakho.

---

### ❌ Mistake 3: Without DTO — using `any`

**Galat:**
```ts
@Post()
create(@Body() body: any) {  // ❌ Koi validation nahi
  return this.usersService.create(body)
}
```

**Sahi:**
```ts
@Post()
create(@Body() dto: CreateUserDto) {  // ✅ Auto-validated
  return this.usersService.create(dto)
}
```

**Kyun?** — `any` se TypeScript ka type safety khatam ho jata hai + validation bhi nahi hoti.

---

### ❌ Mistake 4: Not handling not found

**Galat:**
```ts
async findOne(id: number) {
  const [user] = await this.database.db
    .select().from(users).where(eq(users.id, id)).limit(1)
  return user  // ❌ undefined return ho sakta hai
}
```

**Sahi:**
```ts
async findOne(id: number) {
  const [user] = await this.database.db
    .select().from(users).where(eq(users.id, id)).limit(1)
  if (!user) throw new NotFoundException(`User with id ${id} not found`)  // ✅
  return user
}
```

**Kyun?** — Client ko 404 chahiye, undefined nahi.

---

### ❌ Mistake 5: Forget to exclude password from response

Register/login mein password response mein bhej diya. Express mein bhi same mistake hoti thi.

**Fix:**  
```ts
const { password: _, ...userWithoutPassword } = user
return { user: userWithoutPassword, token }
```

---

### ❌ Mistake 6: Global middleware instead of Guard

**Galat:**
```ts
// app.module.ts — saare routes protected
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*')
  }
}
```

**Problem:** `GET /` (Hello World) bhi protected ho jayega. Har naye route ke liye sochna padega ki exclude karna hai ya nahi.

**Sahi:**
```ts
// users.controller.ts — sirf profile route protected
@Get('profile')
@UseGuards(AuthGuard)
profile(@Req() req: Request) { ... }
```

**Kyun?** — Guard route-specific hai. Jahan lagao wahi kaam karta hai. Naya route banaya to us par guard nahi lagega jab tak explicit `@UseGuards()` na likho.

---

### ❌ Mistake 7: Not importing UsersModule in AuthModule

**Error:** `Nest can't resolve dependencies of AuthService`

**Fix:**  
AuthModule mein UsersModule import karna bhool jaate hain.

```ts
@Module({
  imports: [UsersModule, JwtModule.register(...)],  // ✅ UsersModule import
  providers: [AuthService],
  controllers: [AuthController],
})
```

---

### ❌ Mistake 8: Using `@Req()` without type

**Galat:**
```ts
profile(@Req() req) {  // req any type
  console.log(req.user)  // ❌ TypeScript error: user doesn't exist
}
```

**Sahi:**
```ts
profile(@Req() req: Request) {  // Express Request type
  return this.usersService.profile(req.user!.id)
}
```

Plus: `src/types/express-augment.ts` mein `req.user` ka type declare karo.

---

## 📝 Final Notes

> **Congratulations!** Tumne NestJS + PostgreSQL + Drizzle ORM + JWT Auth ka complete project bana liya.

**Key takeaways:**
1. NestJS mein **structure already defined hai** — tum sirf usme fit ho jao
2. **Har cheez ki designated jagah hai** — Controller (route), Service (logic), Module (grouping), DTO (validation)
3. **AuthService UsersService ko delegate karta hai** — DB access ka single source of truth
4. **Guard route-specific hota hai, Middleware global** — `@UseGuards()` sirf us route par lagao jahan auth chahiye
5. **JWT token se user identify hota hai** — URL mein id nahi deni padti
6. **ValidationPipe + GlobalExceptionFilter** — error handling ka solid foundation

**Aage kya seekhna hai:**
- Drizzle Migrations (generate + migrate for production)
- Role-based access guard (`@Roles('admin')`)
- `@Exclude()` decorator for automatic password hiding (class-transformer)
- File upload, caching, WebSockets, etc.

**Happy Coding! 🚀**

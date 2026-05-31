# NestJS Project — Complete Guide (Hinglish)

## 📁 Project Structure

```
my_first_project/
├── src/
│   ├── main.ts                    # Entry point — app start yahan se hoti hai
│   ├── app.module.ts              # Root module — saare modules yahan import
│   ├── app.controller.ts          # Root controller — GET / hello world
│   ├── app.service.ts             # Root service
│   │
│   ├── db/                        # 📦 Database Module (ALAG)
│   │   ├── database.module.ts     #   @Global() — koi import nahi karna padta
│   │   ├── database.service.ts    #   Drizzle + Pool management
│   │   └── schema.ts              #   Table definition (users table)
│   │
│   ├── users/                     # 📦 User Module (DATA OWNER)
│   │   ├── users.module.ts        #   exports UsersService
│   │   ├── users.controller.ts    #   CRUD routes (GET/POST/PATCH/DELETE)
│   │   ├── users.service.ts       #   Saari user logic yahan — create, find, update, delete, password hash
│   │   └── dto/
│   │       ├── create-user.dto.ts #   Validation rules for creating user
│   │       ├── update-user.dto.ts #   PartialType — sab optional
│   │       └── index.ts           #   Barrel export
│   │
│   └── auth/                      # 📦 Auth Module (DELEGATOR)
│       ├── auth.module.ts         #   imports UsersModule
│       ├── auth.controller.ts     #   /auth/register, /auth/login
│       ├── auth.service.ts        #   UsersService ko call karta hai — DB direct nahi chhota
│       └── dto/
│           ├── register.dto.ts    #   fname, lname, email, password, role
│           ├── login.dto.ts       #   email, password
│           └── index.ts           #   Barrel export
│
├── drizzle.config.ts              # Drizzle kit config (migrations)
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies + scripts
└── eslint.config.mjs              # Linter rules
```

---

## 🚀 Entry Point — `main.ts`

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

| Cheez | Matlab |
|---|---|
| `NestFactory.create(AppModule)` | NestJS AppModule ko load karta hai, saare modules resolve karta hai |
| `app.listen(PORT ?? 3000)` | Server start on port 3000 (ya .env se) |
| `void bootstrap()` | Warning suppress — intentionally await nahi kiya |

---

## 🧩 Root Module — `app.module.ts`

```ts
@Module({
  imports: [DatabaseModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
```

| Decorator | Matlab |
|---|---|
| `@Module({})` | Ye ek NestJS module hai |
| `imports: []` | Doosre modules ko import karta hai |
| `controllers: []` | Is module ke route handlers |
| `providers: []` | Is module ke services (injectable) |

---

## 🗄️ Database Module — `db/`

### `database.module.ts`

```ts
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
```

- **`@Global()`** — Global scope. Kisi bhi module mein import kiye bina `DatabaseService` use kar sakte ho
- **`exports`** — `DatabaseService` doosre modules ke liye available hai

### `database.service.ts`

```ts
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;                            // PostgreSQL connection pool
  private dbInstance!: ReturnType<typeof drizzle<typeof schema>>;

  onModuleInit() {
    // App start hote hi pool create + drizzle instance
    const connectionString = process.env.DATABASE_URL;
    this.pool = new Pool({ connectionString });
    this.dbInstance = drizzle(this.pool, { schema });
  }

  get db() { return this.dbInstance; }             // Drizzle query builder

  async onModuleDestroy() {
    await this.pool.end();                         // App band hote hi pool close
  }
}
```

### `schema.ts` — Table Definition

```ts
import { pgEnum, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);

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
}));

export type User = typeof users.$inferSelect;     // Read type
export type NewUser = typeof users.$inferInsert;  // Insert type
```

| Keyword | Matlab |
|---|---|
| `pgEnum()` | PostgreSQL `ENUM` type — sirf `'student'` ya `'admin'` value |
| `pgTable()` | Table define karta hai |
| `serial('id').primaryKey()` | Auto-increment primary key |
| `text('field').notNull()` | Required string field |
| `.default('student')` | Default value agar nahi diya |
| `.defaultNow()` | Current timestamp default |
| `uniqueIndex()` | Unique constraint on email |
| `$inferSelect` / `$inferInsert` | TypeScript types automatically table se infer karo |

---

## 👤 User Module — `users/` (DATA OWNER)

**Rule:** Saari user-related database logic SIRF yahan. Koi aur module DB direct nahi chhota.

### `users.module.ts`

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],       // AuthModule isko import karega
})
```

- **`exports: [UsersService]`** — Doosre modules (jaise Auth) `UsersService` use kar sakte hain

### `users.controller.ts`

```ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()          create(@Body() dto: CreateUserDto)       → POST   /users
  @Get()           findAll()                                → GET    /users
  @Get(':id')      findOne(@Param('id', ParseIntPipe) id)   → GET    /users/5
  @Patch(':id')    update(@Param('id', ParseIntPipe) id, @Body() dto) → PATCH /users/5
  @Delete(':id')   remove(@Param('id', ParseIntPipe) id)    → DELETE /users/5
}
```

| Decorator | Matlab |
|---|---|
| `@Controller('users')` | Saare routes `/users` se start |
| `@Post()` | HTTP POST |
| `@Get()` | HTTP GET |
| `@Get(':id')` | URL parameter — `:id` |
| `@Patch(':id')` | Partial update |
| `@Delete(':id')` | Delete |
| `@Body()` | Request body parse |
| `@Param('id', ParseIntPipe)` | URL param extract + number convert |
| `ParseIntPipe` | `"5"` → `5`, fail hua to 400 error |

### `users.service.ts`

```ts
@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}
```

**Dependency Injection:** NestJS automatically `DatabaseService` ka singleton instance inject karta hai.

| Method | Kya karta hai |
|---|---|
| `create(dto)` | Email duplicate check → bcrypt hash password → INSERT → return user |
| `findByEmail(email)` | Email se user search → user mila to return, nahi to `null` |
| `validatePassword(plain, hashed)` | `bcrypt.compare()` — password match check |
| `findAll()` | `SELECT * FROM users ORDER BY id` |
| `findOne(id)` | Specific user by id → 404 if not found |
| `update(id, dto)` | Partial update — sirf jo fields diye wahi SET |
| `remove(id)` | Delete user → 404 if not found |

### DTOs — Data Transfer Object

**`create-user.dto.ts`**

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

| Decorator | Matlab |
|---|---|
| `@IsString()` | Value string hona chahiye |
| `@IsNotEmpty()` | Empty/undefined nahi ho sakta |
| `@IsEmail()` | Valid email format |
| `@IsEnum(UserRole)` | Sirf `'student'` ya `'admin'` |
| `!` (non-null assertion) | "TypeScript, ye property runtime mein initialize hogi, error mat do" |

**`update-user.dto.ts`**

```ts
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

- **`PartialType()`** — Saare fields optional banata hai. Sirf jo dena chahte ho wahi do

---

## 🔐 Auth Module — `auth/` (DELEGATOR)

**Rule:** Auth SIRF UsersService ko call karta hai. DB direct kuch nahi karta.

### `auth.module.ts`

```ts
@Module({
  imports: [UsersModule],    // UsersService access ke liye
  controllers: [AuthController],
  providers: [AuthService],
})
```

### `auth.controller.ts`

```ts
@Controller('auth')
export class AuthController {
  @Post('register')  register(@Body() dto: RegisterDto)  → POST /auth/register
  @HttpCode(200)
  @Post('login')     login(@Body() dto: LoginDto)        → POST /auth/login
}
```

- **`@HttpCode(HttpStatus.OK)`** — Default POST ka 201 hota hai, login mein 200 chahiye

### `auth.service.ts`

```ts
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(dto: RegisterDto) {
    // Step 1: RegisterDto → CreateUserDto convert
    const createUserDto = new CreateUserDto();
    createUserDto.fname = dto.fname;
    createUserDto.lname = dto.lname;
    createUserDto.email = dto.email;
    createUserDto.password = dto.password;
    createUserDto.role = dto.role;

    // Step 2: UsersService ko delegate
    return this.usersService.create(createUserDto);
  }

  async login(dto: LoginDto) {
    // Step 1: Email se user find
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Step 2: Password verify
    const isValid = await this.usersService.validatePassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }
}
```

---

## 🔄 Complete Data Flow

```
                        REQUEST
                           │
                           ▼
               ┌───────────────────────┐
               │  AuthController       │
               │  POST /auth/register  │
               └─────────┬─────────────┘
                         │ RegisterDto
                         ▼
               ┌───────────────────────┐
               │  AuthService          │
               │  .register(dto)       │
               └─────────┬─────────────┘
                         │ maps to CreateUserDto
                         ▼
               ┌───────────────────────┐
               │  UsersService         │ ←── AuthModule imports UsersModule
               │  .create(createUserDto)│
               └─────────┬─────────────┘
                         │
                         ▼
               ┌───────────────────────┐
               │  1. Email duplicate?  │──ConflictException←dup
               │  2. bcrypt.hash(pw)   │
               │  3. INSERT INTO users │
               └─────────┬─────────────┘
                         │
                         ▼
               ┌───────────────────────┐
               │  DatabaseService      │
               │  Drizzle ORM          │
               └─────────┬─────────────┘
                         │
                         ▼
               ┌───────────────────────┐
               │  PostgreSQL           │
               │  users table          │
               └───────────────────────┘
                         │
                         ▼
                     RESPONSE
                  (created user)
```

---

## 🔐 Password Flow

```
REGISTER:
  "password123" → usersService.create()
    → bcrypt.hash("password123", 10)
    → "$2b$10$..."  (hashed string)
    → DB mein store

LOGIN:
  "password123" → authService.login()
    → usersService.findByEmail() → user mila
    → usersService.validatePassword("password123", "$2b$10$...")
    → bcrypt.compare("password123", "$2b$10$...")
    → true  →  login success
    → false →  401 Unauthorized
```

---

## 🏗️ Module Dependency Diagram

```
AppModule
│
├── DatabaseModule  (@Global)
│   └── DatabaseService  ←── saare modules use kar sakte hain
│
├── UsersModule
│   ├── UsersController  ←── CRUD routes
│   ├── UsersService     ←── exports → AuthModule
│   └── (uses DatabaseService via DI)
│
├── AuthModule
│   ├── AuthController   ←── register + login routes
│   ├── AuthService      ←── UsersService.inject()
│   └── imports → UsersModule  (taaki UsersService mile)
│
└── AppController + AppService
```

---

## ✅ Key Decisions + Reasoning

| Decision | Kyo kiya |
|---|---|
| **DB alag module (`db/`)** | Connection management ek jagah. `@Global()` — kisi ko import nahi karna padta |
| **`UsersService` mein password hashing** | User creation ka logic user ke paas hona chahiye. Auth sirf authentication ka kaam kare |
| **`AuthService` direct DB nahi chhota** | Auth → UsersService ko call karta hai. Code duplicate nahi hota. Single responsibility |
| **Two DTOs: RegisterDto + CreateUserDto** | Separation of concerns. Auth ka DTO independent ho sakta hai future mein (e.g., extra fields) |
| **Enum shared (`UserRole`)** | Dono modules same enum use karte hain — type safety, values consistent |
| **`PartialType` for update** | Partial update — sirf jo fields bheje wahi change. Clean API design |
| **`types: ["jest", "node"]`** | TypeScript ko batata hai ki `describe`, `it`, `expect` globally available hain (test files mein) |
| **`skipLibCheck: true`** | Build speed — third-party types check nahi karta |

---

## 🚀 Next Steps (Aage kya karein)

### 1. Setup .env file
```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nest_drizzle_db
```

### 2. Create database aur tables
```bash
npx drizzle-kit push       # Schema ko DB mein push karega (migration without files)
# ya
npx drizzle-kit generate   # Migration files generate
npx drizzle-kit migrate    # DB mein apply
```

### 3. Start server
```bash
npm run start:dev
```

### 4. Test endpoints (Postman / curl)

**Register:**
```json
POST /auth/register
{
  "fname": "Rahul",
  "lname": "Sharma",
  "email": "rahul@test.com",
  "password": "secret123",
  "role": "student"
}
```

**Login:**
```json
POST /auth/login
{
  "email": "rahul@test.com",
  "password": "secret123"
}
```

**Get all users:**
```
GET /users
```

### 5. Validation Pipe add karo (main.ts)
```ts
import { ValidationPipe } from '@nestjs/common';
// bootstrap() ke andar:
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
```

### 6. JWT Authentication (next feature)
- `@nestjs/jwt` + `@nestjs/passport` install karo
- JWT token return karo login par
- Guard banao protected routes ke liye

### 7. Role-based access
- `@SetMetadata('roles', ['admin'])` custom decorator
- Guard check karega ki user ke role ke hisaab se access hai ya nahi

---

## 📚 Important NestJS Concepts Summary

| Concept | Explanation |
|---|---|
| **Module** | Application ka logical boundary. `@Module({})` |
| **Controller** | Routes handle karta hai. `@Controller()`, `@Get()`, `@Post()` |
| **Service/Provider** | Business logic. `@Injectable()`, DI se inject hota hai |
| **DTO** | Data Transfer Object — request body ka shape + validation |
| **Pipe** | Data transformation + validation. e.g., `ParseIntPipe`, `ValidationPipe` |
| **Guard** | Authentication / Authorization. Request allow ya deny |
| **Decorator** | `@` se shuru — metadata attach karta hai classes/methods par |
| **Dependency Injection** | NestJS automatically dependencies provide karta hai constructor mein |

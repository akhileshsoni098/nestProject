import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../db/database.service';
import { users } from './schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateUserDto) {
    try {
      const existing = await this.database.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, dto.email))
        .limit(1);

      if (existing.length > 0) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const [created] = await this.database.db
        .insert(users)
        .values({
          fname: dto.fname,
          lname: dto.lname,
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
        })
        .returning();

      return created;
    } catch (error: unknown) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string) {
    try {
      const [user] = await this.database.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return user ?? null;
    } catch (error: unknown) {
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string) {
    try {
      return bcrypt.compare(plainPassword, hashedPassword);
    } catch {
      throw new InternalServerErrorException('Failed to validate password');
    }
  }

  async findAll() {
    try {
      return await this.database.db.select().from(users).orderBy(users.id);
    } catch {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: number) {
    try {
      const [user] = await this.database.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      const payload: Partial<typeof users.$inferInsert> = {};

      if (dto.fname !== undefined) payload.fname = dto.fname;
      if (dto.lname !== undefined) payload.lname = dto.lname;
      if (dto.email !== undefined) payload.email = dto.email;

      if (Object.keys(payload).length === 0) {
        return this.findOne(id);
      }

      const [updated] = await this.database.db
        .update(users)
        .set({
          ...payload,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      if (!updated) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return updated;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number) {
    try {
      const [deleted] = await this.database.db
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });

      if (!deleted) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return { deleted: true, id: deleted.id };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}

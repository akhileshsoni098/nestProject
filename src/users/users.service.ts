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

  async profile(userId: number) {
    const user = await this.findOne(userId);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
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
}

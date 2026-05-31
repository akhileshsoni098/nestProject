import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const createUserDto = new CreateUserDto();
      createUserDto.fname = dto.fname;
      createUserDto.lname = dto.lname;
      createUserDto.email = dto.email;
      createUserDto.password = dto.password;
      createUserDto.role = dto.role;

      const user = await this.usersService.create(createUserDto);

      const token = this.jwtService.sign({ id: user.id });

      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(dto.email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.usersService.validatePassword(
        dto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const token = this.jwtService.sign({ id: user.id });

      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async profile(userId: number) {
    try {
      const user = await this.usersService.findOne(userId);

      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch profile');
    }
  }
}

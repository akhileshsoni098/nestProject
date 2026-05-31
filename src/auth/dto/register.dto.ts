import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../../users/dto/create-user.dto';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fname!: string;

  @IsString()
  @IsNotEmpty()
  lname!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}

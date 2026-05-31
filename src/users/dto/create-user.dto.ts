import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum UserRole {
  student = 'student',
  admin = 'admin',
}

export class CreateUserDto {
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

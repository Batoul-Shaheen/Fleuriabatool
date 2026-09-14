import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
}
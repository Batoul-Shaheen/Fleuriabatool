import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async register(dto: RegisterDto) {
    const user =
      await this.usersService.create(dto);

    return this.generateTokens(
      user.id,
      user.email,
      user.role,
    );
  }

  async login(dto: LoginDto) {
    const user =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'email or password is incorrect',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'email or password is incorrect',
      );
    }

    return this.generateTokens(
      user.id,
      user.email,
      user.role,
    );
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ) {
    const isValid =
      await this.usersService.validateRefreshToken(
        userId,
        refreshToken,
      );

    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid session, please login again',
      );
    }

    const user =
      await this.usersService.findById(userId);

    return this.generateTokens(
      user.id,
      user.email,
      user.role,
    );
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(
      userId,
      null,
    );

    return {
      message: 'Successfully logged out',
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken =
      this.jwtService.sign(payload, {
        secret:
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_SECRET',
          ),
        expiresIn:
          this.configService.getOrThrow<StringValue>(
            'JWT_ACCESS_EXPIRES',
          ),
      });

    const refreshToken =
      this.jwtService.sign(payload, {
        secret:
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
          ),
        expiresIn:
          this.configService.getOrThrow<StringValue>(
            'JWT_REFRESH_EXPIRES',
          ),
      });

    await this.usersService.setRefreshToken(
      userId,
      refreshToken,
    );

    const user =
      await this.usersService.findById(userId);

    return {
      accessToken,
      refreshToken,

      user: this.usersService.toPublicUser(user),
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    await this.usersService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    return {
      message: 'Password changed successfully',
    };
  }
}
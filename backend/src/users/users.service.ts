import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: RegisterDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'this email is already registered',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      mustChangePassword: false,
    });

    return this.usersRepository.save(user);
  }

  async createShopOwner(
    fullName: string,
    email: string,
    phone: string,
    temporaryPassword: string,
  ): Promise<User> {
    return this.createManagedUser(
      fullName,
      email,
      phone,
      temporaryPassword,
      UserRole.SHOP_OWNER,
    );
  }

  async createDriver(
    fullName: string,
    email: string,
    phone: string,
    temporaryPassword: string,
  ): Promise<User> {
    return this.createManagedUser(
      fullName,
      email,
      phone,
      temporaryPassword,
      UserRole.DRIVER,
    );
  }

  private async createManagedUser(
    fullName: string,
    email: string,
    phone: string,
    temporaryPassword: string,
    role: UserRole,
  ): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'this email is already registered',
      );
    }

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      10,
    );

    const user = this.usersRepository.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      mustChangePassword: true,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }

  async findDrivers(): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        role: UserRole.DRIVER,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(id);

    Object.assign(user, dto);

    return this.usersRepository.save(user);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(id);

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException(
        'Current password is incorrect',
      );
    }

    user.password = await bcrypt.hash(
      newPassword,
      10,
    );

    user.mustChangePassword = false;

    await this.usersRepository.save(user);
  }

  async setRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;

    await this.usersRepository.update(id, {
      refreshToken: hashedRefreshToken,
    });
  }

  async validateRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });

    if (!user || !user.refreshToken) {
      return false;
    }

    return bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
  }

  toPublicUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
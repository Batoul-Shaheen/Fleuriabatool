import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { CreateShopOwnerDto } from './dto/create-shop-owner.dto';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async createShopOwner(
    dto: CreateShopOwnerDto,
  ) {
    const user =
      await this.usersService.createShopOwner(
        dto.fullName,
        dto.email,
        dto.phone,
        dto.temporaryPassword,
      );

    return this.usersService.toPublicUser(user);
  }

  async createDriver(
    dto: CreateDriverDto,
  ) {
    const user =
      await this.usersService.createDriver(
        dto.fullName,
        dto.email,
        dto.phone,
        dto.temporaryPassword,
      );

    return this.usersService.toPublicUser(user);
  }
}
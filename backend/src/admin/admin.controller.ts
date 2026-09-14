import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AdminService } from './admin.service';

import { CreateShopOwnerDto } from './dto/create-shop-owner.dto';
import { CreateDriverDto } from './dto/create-driver.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Post('shop-owners')
  createShopOwner(
    @Body() dto: CreateShopOwnerDto,
  ) {
    return this.adminService.createShopOwner(dto);
  }

  @Post('drivers')
  createDriver(
    @Body() dto: CreateDriverDto,
  ) {
    return this.adminService.createDriver(dto);
  }
}
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "../common/enums/user-role.enum";

import { ShopsService } from "./shops.service";
import { CreateShopDto } from "./dto/create-shop.dto";
import { UpdateShopDto } from "./dto/update-shop.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

type AuthUser = {
  id: string;
  role: UserRole;
};

@ApiTags("shops")
@Controller("shops")
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  findAllActive() {
    return this.shopsService.findAllActive();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP_OWNER)
  @Get("mine")
  findMine(@CurrentUser() user: AuthUser) {
    return this.shopsService.findByOwner(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP_OWNER)
  @Patch("mine")
  updateMine(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.updateByOwner(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP_OWNER)
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateShopDto,
  ) {
    return this.shopsService.create(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get("admin/all")
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.shopsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(":id/toggle-active")
  toggleActive(@Param("id") id: string) {
    return this.shopsService.toggleActive(id);
  }
}
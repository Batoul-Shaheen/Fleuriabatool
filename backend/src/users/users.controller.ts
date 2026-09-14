import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './entities/user.entity';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  async getMe(
    @CurrentUser() user: User,
  ) {
    const currentUser =
      await this.usersService.findById(user.id);

    return this.usersService.toPublicUser(currentUser);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ) {
    const updatedUser =
      await this.usersService.update(
        user.id,
        dto,
      );

    return this.usersService.toPublicUser(
      updatedUser,
    );
  }

  @Get('drivers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getDrivers() {
    const drivers =
      await this.usersService.findDrivers();

    return drivers.map((driver) =>
      this.usersService.toPublicUser(driver),
    );
  }
}
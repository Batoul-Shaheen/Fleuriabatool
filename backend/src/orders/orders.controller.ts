import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { OrdersService } from './orders.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

type AuthUser = {
  id: string;
  userId?: string;
  role: UserRole;
};

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}


  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        shopId: {
          type: 'string',
          format: 'uuid',
        },

        items: {
          type: 'string',
          example:
            '[{"giftItemId":"UUID","quantity":2}]',
          description:
            'JSON string containing the order items array',
        },

        occasionType: {
          type: 'string',
          example: 'BIRTHDAY',
        },

        recipientName: {
          type: 'string',
          example: 'Sara Ahmad',
        },

        recipientPhone: {
          type: 'string',
          example: '0599000000',
        },

        deliveryAddress: {
          type: 'string',
          example: 'Hebron, Palestine',
        },

        scheduledDate: {
          type: 'string',
          format: 'date-time',
          example: '2026-10-01T15:00:00.000Z',
        },

        cardMessage: {
          type: 'string',
          example: 'Happy Birthday!',
        },

        image: {
          type: 'string',
          format: 'binary',
          description:
            'Optional reference image from the customer',
        },
      },

      required: [
        'shopId',
        'items',
        'occasionType',
        'recipientName',
        'recipientPhone',
        'deliveryAddress',
        'scheduledDate',
      ],
    },
  })
  create(
    @CurrentUser() user: AuthUser,

    @Body() dto: CreateOrderDto,

    @UploadedFile()
    image?: Express.Multer.File,
  ) {
    const customerId =
      user.id ?? user.userId!;

    return this.ordersService.create(
      customerId,
      dto,
      image,
    );
  }


  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  findMyOrders(
    @CurrentUser() user: AuthUser,
  ) {
    const customerId =
      user.id ?? user.userId!;

    return this.ordersService.findMyOrders(
      customerId,
    );
  }


  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  findAssignedOrders(
    @CurrentUser() user: AuthUser,
  ) {
    const driverId =
      user.id ?? user.userId!;

    return this.ordersService.findAssignedOrders(
      driverId,
    );
  }


  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }


  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.ordersService.findOne(id);
  }


  @Patch(':id/assign-driver')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  assignDriver(
    @Param('id') id: string,

    @Body() dto: AssignDriverDto,
  ) {
    return this.ordersService.assignDriver(
      id,
      dto,
    );
  }


  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.DRIVER,
  )
  updateStatus(
    @Param('id') id: string,

    @Body() dto: UpdateStatusDto,

    @CurrentUser() user: AuthUser,
  ) {
    const userId =
      user.id ?? user.userId!;

    return this.ordersService.updateStatus(
      id,
      dto,
      userId,
      user.role,
    );
  }
}
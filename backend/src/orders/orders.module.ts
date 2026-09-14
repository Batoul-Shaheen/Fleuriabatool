import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveryOrder } from './entities/delivery-order.entity';
import { OrderItem } from './entities/order-item.entity';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { GiftItem } from '../gift-items/entities/gift-item.entity';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryOrder,
      OrderItem,
      User,
      Shop,
      GiftItem,
    ]),

    CloudinaryModule,
  ],

  controllers: [
    OrdersController,
  ],

  providers: [
    OrdersService,
  ],

  exports: [
    OrdersService,
  ],
})
export class OrdersModule {}
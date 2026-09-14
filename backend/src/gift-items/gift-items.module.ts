import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GiftItem } from './entities/gift-item.entity';
import { Shop } from '../shops/entities/shop.entity';

import { GiftItemsService } from './gift-items.service';
import { GiftItemsController } from './gift-items.controller';

import { CloudinaryModule } from '../cloudinary/cloudinary.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      GiftItem,
      Shop,
    ]),
    CloudinaryModule,
  ],
  controllers: [GiftItemsController],
  providers: [GiftItemsService],
  exports: [GiftItemsService],
})
export class GiftItemsModule {}
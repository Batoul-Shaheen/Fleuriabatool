import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { ShopsModule } from './shops/shops.module';
import { GiftItemsModule } from './gift-items/gift-items.module';
import { DeliveryOrder } from './orders/entities/delivery-order.entity';
import { User } from './users/entities/user.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Shop } from './shops/entities/shop.entity';
import { GiftItem } from './gift-items/entities/gift-item.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
     }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') ?? '5432', 10),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, DeliveryOrder, OrderItem, Shop, GiftItem],
        synchronize: true,}),
    }),
    UsersModule, OrdersModule, ShopsModule, GiftItemsModule, AuthModule, AdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
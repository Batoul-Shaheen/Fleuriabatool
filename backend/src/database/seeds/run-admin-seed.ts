import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { DeliveryOrder } from '../../orders/entities/delivery-order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { GiftItem } from '../../gift-items/entities/gift-item.entity';

import { seedAdmin } from './admin.seed';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [
    User,
    DeliveryOrder,
    OrderItem,
    Shop,
    GiftItem,
  ],

  synchronize: false,
});

async function run() {
  await dataSource.initialize();

  try {
    await seedAdmin(dataSource);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error('Admin seed failed:', error);
  process.exit(1);
});
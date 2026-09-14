import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { Shop } from '../../shops/entities/shop.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('gift_items')
export class GiftItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price!: number;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @ManyToOne(() => Shop, (shop) => shop.items, {
    onDelete: 'CASCADE',
  })
  shop!: Shop;

  @Column('uuid')
  shopId!: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.giftItem)
  orderItems!: OrderItem[];

  @Column({ default: true })
  isAvailable!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
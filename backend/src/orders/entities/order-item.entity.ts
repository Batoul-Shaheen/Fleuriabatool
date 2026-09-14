import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { DeliveryOrder } from './delivery-order.entity';
import { GiftItem } from '../../gift-items/entities/gift-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => DeliveryOrder, (order) => order.orderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order!: DeliveryOrder;

  @Column('uuid')
  orderId!: string;

  @ManyToOne(() => GiftItem, (giftItem) => giftItem.orderItems, {
    eager: true,
  })
  @JoinColumn({ name: 'giftItemId' })
  giftItem!: GiftItem;

  @Column('uuid')
  giftItemId!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;
}
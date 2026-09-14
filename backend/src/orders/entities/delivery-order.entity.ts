import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { OccasionType } from '../../common/enums/occasion-type.enum';
import { OrderStatus } from '../../common/enums/order-status.enum'; 
import { OrderItem } from './order-item.entity';

@Entity('delivery_orders')
export class DeliveryOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: true })
  referenceImageUrl!: string | null;

  @ManyToOne(() => User, (user) => user.orders, {
    eager: true,
  })
  @JoinColumn({ name: 'customerId' })
  customer!: User;

  @Column('uuid')
  customerId!: string;

  @ManyToOne(() => Shop, (shop) => shop.orders, {
    eager: true,
  })
  @JoinColumn({ name: 'shopId' })
  shop!: Shop;

  @Column('uuid')
  shopId!: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems!: OrderItem[];

  @ManyToOne(() => User, (user) => user.assignedOrders, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'driverId' })
  driver!: User | null;

  @Column('uuid', { nullable: true })
  driverId!: string | null;

  @Column({
    type: 'enum',
    enum: OccasionType,
  })
  occasionType!: OccasionType;

  @Column()
  recipientName!: string;

  @Column()
  recipientPhone!: string;

  @Column()
  deliveryAddress!: string;

  @Column({ type: 'timestamptz' })
  scheduledDate!: Date;

  @Column({ type: 'text', nullable: true })
  cardMessage!: string | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

import { User } from "../../users/entities/user.entity";
import { GiftItem } from "../../gift-items/entities/gift-item.entity";
import { DeliveryOrder } from "../../orders/entities/delivery-order.entity";

@Entity("shops")
export class Shop {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column({ type: "varchar", length: 10 })
  phone!: string ;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @ManyToOne(() => User, (user) => user.shops, {
    eager: true,
  })
  @JoinColumn({ name: "ownerId" })
  owner!: User;

  @Column("uuid")
  ownerId!: string;

  @OneToMany(() => GiftItem, (item) => item.shop)
  items!: GiftItem[];

  @OneToMany(() => DeliveryOrder, (order) => order.shop)
  orders!: DeliveryOrder[];

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { Shop } from '../../shops/entities/shop.entity';
import { DeliveryOrder } from '../../orders/entities/delivery-order.entity';
import { Exclude } from 'class-transformer';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ default: false })
  mustChangePassword!: boolean;

  @Column()
  phone!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  
  @OneToMany(() => Shop, (shop) => shop.owner)
  shops!: Shop[];

  
  @OneToMany(() => DeliveryOrder, (order) => order.customer)
  orders!: DeliveryOrder[];

  
  @OneToMany(() => DeliveryOrder, (order) => order.driver)
  assignedOrders!: DeliveryOrder[];

  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  refreshToken!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
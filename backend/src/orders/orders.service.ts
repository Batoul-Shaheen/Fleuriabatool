import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DeliveryOrder } from './entities/delivery-order.entity';
import { OrderItem } from './entities/order-item.entity';

import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';
import { GiftItem } from '../gift-items/entities/gift-item.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

import { UserRole } from '../common/enums/user-role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(DeliveryOrder)
    private readonly ordersRepo: Repository<DeliveryOrder>,

    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,

    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,

    @InjectRepository(Shop)
    private readonly shopsRepo: Repository<Shop>,

    @InjectRepository(GiftItem)
    private readonly giftItemsRepo: Repository<GiftItem>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // =========================
  // CREATE ORDER
  // =========================

  async create(
    customerId: string,
    dto: CreateOrderDto,
    image?: Express.Multer.File,
  ) {
    // Check that the shop exists and is active
    const shop = await this.shopsRepo.findOne({
      where: {
        id: dto.shopId,
        isActive: true,
      },
    });

    if (!shop) {
      throw new NotFoundException(
        'shop is not found or inactive',
      );
    }

    // Check that at least one item exists
    if (
      !dto.items ||
      dto.items.length === 0
    ) {
      throw new BadRequestException(
        'at least one product must be added to the order',
      );
    }

    // Get gift item IDs
    const giftItemIds = dto.items.map(
      (item) => item.giftItemId,
    );

    // Find gift items
    const giftItems =
      await this.giftItemsRepo.find({
        where: giftItemIds.map((id) => ({
          id,
        })),
      });

    // Check that all items exist
    if (
      giftItems.length !== giftItemIds.length
    ) {
      throw new NotFoundException(
        'one or more gift items not found',
      );
    }

    // Check that all items belong to the same shop
    const invalidShopItem =
      giftItems.find(
        (item) =>
          item.shopId !== dto.shopId,
      );

    if (invalidShopItem) {
      throw new BadRequestException(
        'all products must be from the same shop',
      );
    }

    // Check that all items are available
    const unavailableItem =
      giftItems.find(
        (item) => !item.isAvailable,
      );

    if (unavailableItem) {
      throw new BadRequestException(
        `product "${unavailableItem.name}" is not available at the moment`,
      );
    }

    // =========================
    // UPLOAD REFERENCE IMAGE
    // =========================

    let referenceImageUrl: string | null =
      null;

    if (image) {
      referenceImageUrl =
        await this.cloudinaryService.uploadImage(
          image,
        );
    }

    // =========================
    // CREATE ORDER
    // =========================

    const order =
      this.ordersRepo.create({
        customerId,

        shopId: dto.shopId,

        occasionType: dto.occasionType,

        recipientName:
          dto.recipientName,

        recipientPhone:
          dto.recipientPhone,

        deliveryAddress:
          dto.deliveryAddress,

        scheduledDate:
          new Date(dto.scheduledDate),

        cardMessage:
          dto.cardMessage ?? null,

        referenceImageUrl,

        status: OrderStatus.PENDING,
      });

    const savedOrder =
      await this.ordersRepo.save(order);

    // =========================
    // CREATE ORDER ITEMS
    // =========================

    const orderItems = dto.items.map(
      (dtoItem) => {
        const giftItem =
          giftItems.find(
            (item) =>
              item.id ===
              dtoItem.giftItemId,
          )!;

        return this.orderItemsRepo.create({
          orderId: savedOrder.id,

          giftItemId: giftItem.id,

          quantity: dtoItem.quantity,
        });
      },
    );

    await this.orderItemsRepo.save(
      orderItems,
    );

    // Return complete order
    return this.findOne(
      savedOrder.id,
    );
  }

  // =========================
  // MY ORDERS
  // =========================

  async findMyOrders(
    customerId: string,
  ) {
    return this.ordersRepo.find({
      where: {
        customerId,
      },

      relations: {
        orderItems: {
          giftItem: true,
        },
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  // =========================
  // ALL ORDERS
  // =========================

  async findAll() {
    return this.ordersRepo.find({
      relations: {
        orderItems: {
          giftItem: true,
        },
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }

  // =========================
  // GET ONE ORDER
  // =========================

  async findOne(id: string) {
    const order =
      await this.ordersRepo.findOne({
        where: {
          id,
        },

        relations: {
          orderItems: {
            giftItem: true,
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'order not found',
      );
    }

    return order;
  }

  // =========================
  // DRIVER ORDERS
  // =========================

  async findAssignedOrders(
    driverId: string,
  ) {
    return this.ordersRepo.find({
      where: {
        driverId,
      },

      relations: {
        orderItems: {
          giftItem: true,
        },
      },

      order: {
        scheduledDate: 'ASC',
      },
    });
  }

  // =========================
  // ASSIGN DRIVER
  // =========================

  async assignDriver(
    orderId: string,
    dto: AssignDriverDto,
  ) {
    const order =
      await this.findOne(orderId);

    const driver =
      await this.usersRepo.findOne({
        where: {
          id: dto.driverId,
          role: UserRole.DRIVER,
        },
      });

    if (!driver) {
      throw new NotFoundException(
        'driver not found',
      );
    }

    order.driverId = driver.id;

    return this.ordersRepo.save(order);
  }

  // =========================
  // UPDATE STATUS
  // =========================

  async updateStatus(
    orderId: string,
    dto: UpdateStatusDto,
    userId: string,
    role: UserRole,
  ) {
    const order =
      await this.findOne(orderId);

    // Driver can only update
    // orders assigned to him
    if (
      role === UserRole.DRIVER &&
      order.driverId !== userId
    ) {
      throw new ForbiddenException(
        'this order is not assigned to you',
      );
    }

    order.status = dto.status;

    return this.ordersRepo.save(order);
  }
}
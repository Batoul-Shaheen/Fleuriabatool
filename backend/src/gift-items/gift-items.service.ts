import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GiftItem } from './entities/gift-item.entity';
import { Shop } from '../shops/entities/shop.entity';

import { CreateGiftItemDto } from './dto/create-gift-item.dto';
import { UpdateGiftItemDto } from './dto/update-gift-item.dto';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class GiftItemsService {
  constructor(
    @InjectRepository(GiftItem)
    private readonly giftItemsRepo: Repository<GiftItem>,

    @InjectRepository(Shop)
    private readonly shopsRepo: Repository<Shop>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    shopId: string,
    ownerId: string,
    dto: CreateGiftItemDto,
    image?: Express.Multer.File,
  ) {
    // Check that the shop exists
    const shop = await this.shopsRepo.findOne({
      where: {
        id: shopId,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    // Check that the shop belongs to the logged-in owner
    if (shop.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You can only manage your own shop',
      );
    }

    // Upload image if provided
    let imageUrl: string | null = null;

    if (image) {
      imageUrl =
        await this.cloudinaryService.uploadImage(image);
    }

    const giftItem = this.giftItemsRepo.create({
      ...dto,
      shopId,
      imageUrl,
    });

    return this.giftItemsRepo.save(giftItem);
  }

  async findByShop(shopId: string) {
    const shop = await this.shopsRepo.findOne({
      where: {
        id: shopId,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    return this.giftItemsRepo.find({
      where: {
        shopId,
        isAvailable: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const giftItem =
      await this.giftItemsRepo.findOne({
        where: { id },
      });

    if (!giftItem) {
      throw new NotFoundException(
        'Gift item not found',
      );
    }

    return giftItem;
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateGiftItemDto,
    image?: Express.Multer.File,
  ) {
    const giftItem =
      await this.giftItemsRepo.findOne({
        where: { id },
      });

    if (!giftItem) {
      throw new NotFoundException(
        'Gift item not found',
      );
    }

    // Find the shop that owns this item
    const shop = await this.shopsRepo.findOne({
      where: {
        id: giftItem.shopId,
      },
    });

    if (!shop) {
      throw new NotFoundException(
        'Shop not found',
      );
    }

    // Check ownership
    if (shop.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You can only manage your own shop items',
      );
    }

    // Upload new image if provided
    if (image) {
      giftItem.imageUrl =
        await this.cloudinaryService.uploadImage(image);
    }

    // Update other fields
    Object.assign(giftItem, dto);

    return this.giftItemsRepo.save(giftItem);
  }

  async remove(
    id: string,
    ownerId: string,
  ) {
    const giftItem =
      await this.giftItemsRepo.findOne({
        where: { id },
      });

    if (!giftItem) {
      throw new NotFoundException(
        'Gift item not found',
      );
    }

    const shop =
      await this.shopsRepo.findOne({
        where: {
          id: giftItem.shopId,
        },
      });

    if (!shop) {
      throw new NotFoundException(
        'Shop not found',
      );
    }

    if (shop.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You can only manage your own shop items',
      );
    }

    await this.giftItemsRepo.remove(giftItem);

    return {
      message: 'Gift item deleted successfully',
    };
  }
}
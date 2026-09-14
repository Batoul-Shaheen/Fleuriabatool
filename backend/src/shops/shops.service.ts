import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Shop } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepo: Repository<Shop>,
  ) {}



  async create(
    ownerId: string,
    dto: CreateShopDto,
  ) {
    const existingShop =
      await this.shopsRepo.findOne({
        where: { ownerId },
      });

    if (existingShop) {
      throw new ConflictException(
        'You already have a shop registered',
      );
    }

    const shop = this.shopsRepo.create({
      ...dto,
      ownerId,
    });

    return this.shopsRepo.save(shop);
  }

async findByOwner(ownerId: string) {
  const shop = await this.shopsRepo.findOne({
    where: { ownerId },
    relations: {
      items: true,
    },
  });

  if (!shop) {
    throw new NotFoundException(
      'You have not registered a shop yet',
    );
  }

  return shop;
}

  async updateByOwner(
    ownerId: string,
    dto: UpdateShopDto,
  ) {
    const shop =
      await this.shopsRepo.findOne({
        where: { ownerId },
      });

    if (!shop) {
      throw new NotFoundException(
        'You have not registered a shop yet',
      );
    }

    Object.assign(shop, dto);

    return this.shopsRepo.save(shop);
  }

  

  findAllActive() {
    return this.shopsRepo.find({
      where: {
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

 async findOne(id: string) {
  const shop = await this.shopsRepo.findOne({
    where: { id },
    relations: {
      items: true,
    },
  });

  if (!shop) {
    throw new NotFoundException('Shop not found');
  }

  return shop;
}

  

  findAll() {
    return this.shopsRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async toggleActive(id: string) {
    const shop =
      await this.findOne(id);

    shop.isActive = !shop.isActive;

    return this.shopsRepo.save(shop);
  }
}   
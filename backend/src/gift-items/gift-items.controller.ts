import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';

import { GiftItemsService } from './gift-items.service';

import { CreateGiftItemDto } from './dto/create-gift-item.dto';
import { UpdateGiftItemDto } from './dto/update-gift-item.dto';


import { CurrentUser } from '../common/decorators/current-user.decorator';

import { UserRole } from '../common/enums/user-role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

type AuthUser = {
  id: string;
  role: UserRole;
};

@ApiTags('gift-items')
@Controller('gift-items')
export class GiftItemsController {
  constructor(
    private readonly giftItemsService: GiftItemsService,
  ) {}

  @Get('shop/:shopId')
  findByShop(
    @Param('shopId') shopId: string,
  ) {
    return this.giftItemsService.findByShop(
      shopId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.giftItemsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP_OWNER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Red Roses Bouquet',
        },
        description: {
          type: 'string',
          example: 'Beautiful bouquet for birthdays',
        },
        price: {
          type: 'number',
          example: 35,
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name', 'price'],
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @Post('shop/:shopId')
  create(
    @Param('shopId') shopId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateGiftItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.giftItemsService.create(
      shopId,
      user.id,
      dto,
      image,
    );
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP_OWNER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Red Roses Bouquet',
        },
        description: {
          type: 'string',
          example: 'Updated description',
        },
        price: {
          type: 'number',
          example: 40,
        },
        isAvailable: {
          type: 'boolean',
          example: true,
        },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateGiftItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.giftItemsService.update(
      id,
      user.id,
      dto,
      image,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SHOP_OWNER)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.giftItemsService.remove(
      id,
      user.id,
    );
  }
}
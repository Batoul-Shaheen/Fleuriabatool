
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsUUID()
  giftItemId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity!: number;
}
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { Type } from 'class-transformer';

import { OccasionType } from '../../common/enums/occasion-type.enum';
import { CreateOrderItemDto } from './create-order-item.dto';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return new Date(value).getTime() > Date.now();
  }

  defaultMessage() {
    return 'scheduledDate must be in the future';
  }
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiProperty({ enum: OccasionType })
  @IsEnum(OccasionType)
  occasionType!: OccasionType;

  @ApiProperty()
  @IsString()
  recipientName!: string;

  @ApiProperty()
  @IsString()
  recipientPhone!: string;

  @ApiProperty()
  @IsString()
  deliveryAddress!: string;

  @ApiProperty({
    description: 'ISO date-time; must be in the future',
  })
  @IsDateString()
  @Validate(IsFutureDateConstraint)
  scheduledDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardMessage?: string;
}
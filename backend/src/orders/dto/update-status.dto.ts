import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateStatusDto {
  @ApiProperty()
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
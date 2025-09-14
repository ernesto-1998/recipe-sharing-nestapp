import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IngredientDto {
  @ApiProperty({
    example: 'Tomato',
    description: 'Name of the ingredient',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '2',
    description: 'Quantity of the ingredient (as string to allow fractions)',
  })
  @IsString()
  quantity: string;

  @ApiProperty({
    example: 'unit',
    description: 'Unit of the ingredient (e.g., kg, g, unit, cup)',
  })
  @IsString()
  unit: string;
}

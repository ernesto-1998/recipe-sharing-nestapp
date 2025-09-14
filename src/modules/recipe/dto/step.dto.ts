import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class StepDto {
  @ApiProperty({
    example: 1,
    description: 'Order number of the step',
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    example: 'Chop the tomatoes into small cubes.',
    description: 'Instruction for this step',
  })
  @IsString()
  instruction: string;
}

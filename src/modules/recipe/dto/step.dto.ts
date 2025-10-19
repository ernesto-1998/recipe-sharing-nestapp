import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class StepDto {
  @ApiProperty({
    example: 1,
    description: 'Order number of the step',
  })
  @IsInt({ message: 'Order must be an integer.' })
  @Min(0, { message: 'Order cannot be negative.' })
  order: number;

  @ApiProperty({
    example: 'Chop the tomatoes into small cubes.',
    description: 'Instruction for this step',
  })
  @IsString()
  instruction: string;
}

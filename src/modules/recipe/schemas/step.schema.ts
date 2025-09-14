import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Step {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  instruction: string;
}

export const StepSchema = SchemaFactory.createForClass(Step);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Step {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  instruction: string;
}

export const StepSchema = SchemaFactory.createForClass(Step);

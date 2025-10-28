import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Unit } from 'src/common/enums/ingredient-units.enum';

@Schema({ _id: false })
export class Ingredient {
  @Prop({ required: true, set: (value: string) => value.trim().toLowerCase() })
  name: string;

  @Prop({ required: true })
  quantity: string;

  @Prop({ type: String, enum: Unit })
  unit: Unit;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);

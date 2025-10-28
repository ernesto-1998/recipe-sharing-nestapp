import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Ingredient, IngredientSchema } from './ingredient.schema';
import { Step, StepSchema } from './step.schema';
import { PrivacyLevel } from 'src/common/enums';

export type RecipeDocument = HydratedDocument<Recipe>;

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [IngredientSchema], default: [] })
  ingredients: Ingredient[];

  @Prop({ type: [StepSchema], default: [] })
  steps: Step[];

  @Prop({ required: true })
  prepTime: number;

  @Prop({ required: true })
  portions: number;

  @Prop({
    required: true,
    trim: true,
    set: (value: string) => value.trim().toLowerCase(),
  })
  category: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    type: [String],
    default: [],
    set: (tags: string[]) => tags.map((t) => t.trim().toLowerCase()),
  })
  tags: string[];

  @Prop({
    type: String,
    enum: PrivacyLevel,
    default: PrivacyLevel.PUBLIC,
  })
  privacy?: PrivacyLevel;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

RecipeSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

RecipeSchema.set('toJSON', { virtuals: true });
RecipeSchema.set('toObject', { virtuals: true });
RecipeSchema.set('id', false);

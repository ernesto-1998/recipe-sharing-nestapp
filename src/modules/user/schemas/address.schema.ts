import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Coordinates } from './coordinates.schema';

@Schema({ _id: false })
export class Address {
  @Prop()
  country: string;

  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop({ required: false })
  postalCode?: string;

  @Prop({ type: Coordinates, required: false })
  coordinates?: Coordinates;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

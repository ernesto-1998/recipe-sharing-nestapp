import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Address {
  @Prop()
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

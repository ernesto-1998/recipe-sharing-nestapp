import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Coordinates {
  @Prop()
  lat: number;

  @Prop()
  lng: number;
}

export const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);

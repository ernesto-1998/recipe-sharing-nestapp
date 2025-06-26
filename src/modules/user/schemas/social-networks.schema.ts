import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SocialNetworks {
  @Prop({ required: false })
  instagram?: string;

  @Prop({ required: false })
  youtube?: string;

  @Prop({ required: false })
  x?: string;

  @Prop({ required: false })
  facebook?: string;

  @Prop({ required: false })
  tiktok?: string;
}

export const SocialNetworksSchema =
  SchemaFactory.createForClass(SocialNetworks);

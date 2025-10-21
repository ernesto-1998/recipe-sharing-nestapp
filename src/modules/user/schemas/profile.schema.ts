import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from './address.schema';
import { SocialNetworks } from './social-networks.schema';

@Schema({ _id: false })
export class Profile {
  @Prop()
  firstname?: string;

  @Prop()
  lastname?: string;

  @Prop({ required: false })
  biography?: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ required: false })
  birthDate?: Date;

  @Prop({ type: SocialNetworks, required: false })
  socialNetworks?: SocialNetworks;

  @Prop({ type: Address, required: false })
  address?: Address;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

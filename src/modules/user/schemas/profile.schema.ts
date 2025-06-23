import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Address } from './address.schema';
import { SocialNetworks } from './social-networks.schema';

@Schema()
export class Profile {
  @Prop()
  name: string;

  @Prop({ required: false })
  biography?: string;

  @Prop({ required: false })
  profilePic?: string;

  @Prop({ type: SocialNetworks, required: false })
  social_networks?: SocialNetworks;

  @Prop({ type: Address, required: false })
  address?: Address;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

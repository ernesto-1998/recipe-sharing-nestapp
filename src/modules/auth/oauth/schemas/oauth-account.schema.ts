import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type OAuthAccountDocument = HydratedDocument<OAuthAccount>;

@Schema({ timestamps: true })
export class OAuthAccount {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true, index: true })
  providerId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  picture?: string;
}

export const OAuthAccountSchema = SchemaFactory.createForClass(OAuthAccount);

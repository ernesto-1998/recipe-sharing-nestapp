import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User, UserDocument } from 'src/modules/user/schemas';
import { OAuthProviderName } from '../enums';

export type OAuthAccountDocument = HydratedDocument<OAuthAccount>;
export interface OAuthAccountWithUser extends OAuthAccountDocument {
  user: UserDocument;
}

@Schema({
  timestamps: true,
})
export class OAuthAccount {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: OAuthProviderName })
  provider: OAuthProviderName;

  @Prop({ required: true })
  providerId: string;

  @Prop()
  email?: string;
}

export const OAuthAccountSchema = SchemaFactory.createForClass(OAuthAccount);

/* OAuthAccountSchema.virtual('user', {
  ref: User.name,
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

OAuthAccountSchema.set('toObject', { virtuals: true });
OAuthAccountSchema.set('toJSON', { virtuals: true }); */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Profile } from './profile.schema';
import { PrivacyLevel, UserRolesLevel } from 'src/common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: UserRolesLevel,
  })
  role: UserRolesLevel;

  @Prop({ type: Profile, required: false })
  profile?: Profile;

  @Prop({
    type: String,
    enum: PrivacyLevel,
    default: PrivacyLevel.PUBLIC,
  })
  privacy?: PrivacyLevel;
}

export const UserSchema = SchemaFactory.createForClass(User);

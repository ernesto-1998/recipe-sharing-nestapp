import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Profile } from './profile.schema';
import { privacyLevel } from 'src/common/enums';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  role: string;

  @Prop({ type: Profile, required: false })
  profile?: Profile;

  @Prop({
    type: String,
    enum: privacyLevel,
    default: privacyLevel.PUBLIC,
  })
  privacy?: privacyLevel;
}

export const UserSchema = SchemaFactory.createForClass(User);

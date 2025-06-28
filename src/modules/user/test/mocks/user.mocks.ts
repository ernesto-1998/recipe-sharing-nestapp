import { Profile } from '../../schemas/profile.schema';
import { UserDocument } from '../../schemas/user.schema';
import { Types } from 'mongoose';

export const mockMongoUser: UserDocument = {
  _id: new Types.ObjectId('60f7c0e2e2a2c2a4d8e2e2a2'),
  email: 'robert@example.com',
  username: 'robert123',
  role: 'user',
  passwordHash: 'hashedPassword',
  profile: {} as Profile,
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0,

  toObject: function () {
    return { ...(this as UserDocument) };
  },

  $isDeleted: false,
  $isEmpty: () => false,
  $session: () => null,
} as unknown as UserDocument;

export const mockUpdatedMongoUser: UserDocument = {
  ...mockMongoUser,
  _id: new Types.ObjectId('60f7c0e2e2a2c2a4d8e2e2a2'),
  username: 'updatedUser',
} as unknown as UserDocument;

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto';
import { flattenObject } from 'src/common/utils/flatten';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll({
    skip = 0,
    limit = 10,
  }: {
    skip?: number;
    limit?: number;
  } = {}): Promise<UserDocument[]> {
    return this.userModel.find().skip(skip).limit(limit).exec();
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    return !!user;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username }).exec();
    return !!user;
  }

  updateById(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: flattenObject(updateUserDto as Record<string, unknown>) },
        { new: true, runValidators: true },
      )
      .exec();
  }

  deleteById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(userId).exec();
  }
}

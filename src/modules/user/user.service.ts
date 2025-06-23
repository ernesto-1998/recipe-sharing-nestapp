import { Injectable, ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser: User | null = await this.findByEmail(
      createUserDto.email,
    );
    if (existingUser != null)
      throw new ConflictException('User with this email already exists.');
    const hashedPassword: string = await bcrypt.hash(
      createUserDto.passwordHash,
      10,
    );

    const createdUser = new this.userModel({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
    const savedUser = await createdUser.save();
    const savedUserWithoutPassword = plainToInstance(
      ResponseUserDto,
      savedUser.toObject(),
    );
    return savedUserWithoutPassword;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(username?: string, email?: string): Promise<User | null> {
    return this.userModel.findOne({
      $or: [{ email: email }, { username: username }],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username: username }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email }).exec();
  }

  //update(id: number, updateUserDto: UpdateUserDto) {
  //return `This action updates a #${id} user`;
  //}

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { User } from './schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const existingUser: User | null = await this.findByEmail(
      createUserDto.email,
    );
    if (existingUser != null)
      throw new ConflictException('User with this email already exists.');
    const hashedPassword: string = await bcrypt.hash(
      createUserDto.passwordHash,
      10,
    );

    const createdUser = await this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
    const savedUser = plainToInstance(ResponseUserDto, createdUser.toObject());
    return savedUser;
  }

  async findAll(): Promise<ResponseUserDto[]> {
    const users = await this.userRepository.findAll();
    const reponseUsers = users.map((user) =>
      plainToInstance(ResponseUserDto, user.toObject()),
    );
    return reponseUsers;
  }

  findOne(username?: string, email?: string): Promise<User | null> {
    return this.userRepository.findOne(username, email);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne(username);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  //update(id: number, updateUserDto: UpdateUserDto) {
  //return `This action updates a #${id} user`;
  //}

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

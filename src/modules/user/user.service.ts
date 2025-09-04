import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, UpdateUserDto, ResponseUserDto } from './dto';
import { UserDocument } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import { UserMapper } from './user.mapper';
import type { AppLogger } from 'src/common/interfaces/app-logger.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('AppLogger') private readonly logger: AppLogger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const existingUserByEmail: boolean =
      await this.userRepository.existsByEmail(createUserDto.email);
    const existingUserByUsername: boolean =
      await this.userRepository.existsByUsername(createUserDto.username);

    if (existingUserByEmail)
      throw new ConflictException('User with this email already exists.');
    if (existingUserByUsername)
      throw new ConflictException('User with this username already exists.');
    const hashedPassword: string = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return UserMapper.toResponse(user);
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    if (updateUserDto?.email) {
      const emailExists = await this.userRepository.existsByEmail(
        updateUserDto.email,
      );
      if (emailExists) {
        throw new ConflictException('Email is already in use.');
      }
    }
    if (updateUserDto?.username) {
      const usernameExists = await this.userRepository.existsByUsername(
        updateUserDto.username,
      );
      if (usernameExists) {
        throw new ConflictException('Username is already in use.');
      }
    }
    const user = await this.userRepository.updateById(userId, updateUserDto);
    if (user === null)
      throw new NotFoundException('User with this ID does not exists.');
    return UserMapper.toResponse(user);
  }

  async remove(userId: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.deleteById(userId);
    if (user === null)
      throw new NotFoundException('User with this ID does not exists.');
    return UserMapper.toResponse(user);
  }

  async findAll(): Promise<ResponseUserDto[]> {
    const users = await this.userRepository.findAll();
    return UserMapper.toResponseMany(users);
  }

  async findById(userId: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findById(userId);
    if (user === null)
      throw new NotFoundException('User with this ID does not exists.');
    return UserMapper.toResponse(user);
  }

  async findByUsername(username: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findByUsername(username);
    if (user === null)
      throw new NotFoundException('User with this username does not exists.');
    return UserMapper.toResponse(user);
  }

  async findByEmail(email: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findByEmail(email);
    if (user === null)
      throw new NotFoundException('User with this email does not exists.');
    return UserMapper.toResponse(user);
  }

  async checkIfUserExistsByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async checkIfUserExistsByUsername(
    username: string,
  ): Promise<UserDocument | null> {
    return this.userRepository.findByUsername(username);
  }
}

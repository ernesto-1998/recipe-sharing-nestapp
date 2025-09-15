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
import type { AppLogger } from 'src/common/interfaces/app-logger.interface';
import { Mapper } from 'src/common/utils/mapper';

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

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists.');
    }
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
    this.logger.log(
      {
        message: 'User created.',
        userId: user._id,
      },
      UserService.name,
    );
    return Mapper.toResponse(ResponseUserDto, user);
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

    const { password: _password, ...safeDto } = updateUserDto ?? {};
    this.logger.log(
      {
        message: 'User updated.',
        userId,
        newValues: safeDto,
      },
      UserService.name,
    );
    return Mapper.toResponse(ResponseUserDto, user);
  }

  async remove(userId: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.deleteById(userId);
    if (user === null)
      throw new NotFoundException('User with this ID does not exists.');
    this.logger.log(
      {
        message: 'User deleted',
        userId,
      },
      UserService.name,
    );
    return Mapper.toResponse(ResponseUserDto, user);
  }

  async findAll(): Promise<ResponseUserDto[]> {
    const users = await this.userRepository.findAll();
    return Mapper.toResponseMany(ResponseUserDto, users);
  }

  async findById(userId: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findById(userId);
    if (user === null)
      throw new NotFoundException('User with this ID does not exists.');
    return Mapper.toResponse(ResponseUserDto, user);
  }

  async findByUsername(username: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findByUsername(username);
    if (user === null)
      throw new NotFoundException('User with this username does not exists.');
    return Mapper.toResponse(ResponseUserDto, user);
  }

  async findByEmail(email: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.findByEmail(email);
    if (user === null)
      throw new NotFoundException('User with this email does not exists.');
    return Mapper.toResponse(ResponseUserDto, user);
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

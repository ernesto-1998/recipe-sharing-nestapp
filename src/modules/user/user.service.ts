import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  CreateUserDto,
  UpdateUserDto,
  ResponseUserDto,
  PaginatedUsersResponseDto,
} from './dto';
import { UserDocument } from './schemas/user.schema';
import { UserRepository } from './user.repository';
import type { AppLogger } from 'src/common/interfaces/app-logger.interface';
import { Mapper } from 'src/common/utils/mapper';
import { buildPaginationInfo } from 'src/common/utils/pagination';
import { PaginationQueryDto } from 'src/common/dto';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CustomToken.APP_LOGGER) private readonly logger: AppLogger,
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
      HttpStatus.CREATED,
    );
    return Mapper.toResponse(ResponseUserDto, user);
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
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

    this.logger.log(
      {
        message: 'User updated.',
        userId,
        newValues: updateUserDto,
      },
      UserService.name,
      HttpStatus.OK,
    );
    return Mapper.toResponse(ResponseUserDto, user);
  }

  async remove(userId: string): Promise<ResponseUserDto> {
    const user = await this.userRepository.deleteById(userId);
    if (user === null)
      throw new NotFoundException('User with this ID does not exists.');
    this.logger.log(
      {
        message: 'User deleted.',
        userId,
      },
      UserService.name,
      HttpStatus.OK,
    );
    return Mapper.toResponse(ResponseUserDto, user);
  }

  async findAll(
    { page = 1, limit = 10 }: PaginationQueryDto,
    baseUrl: string,
  ): Promise<PaginatedUsersResponseDto> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findAll({ skip, limit }),
      this.userRepository.count(),
    ]);

    return {
      info: buildPaginationInfo(total, page, limit, baseUrl),
      results: Mapper.toResponseMany(ResponseUserDto, users),
    };
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

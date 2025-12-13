import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  CreateUserDto,
  UpdateUserDto,
  ResponseUserDto,
  PaginatedUsersResponseDto,
  ChangePasswordDto,
} from '../dto';
import { User, UserDocument } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';
import type { AppLogger } from 'src/common/interfaces/app-logger.interface';
import { Mapper } from 'src/common/utils/mapper';
import { buildPaginationInfo } from 'src/common/utils/pagination';
import { PaginationQueryDto } from 'src/common/dto';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { PrivacyLevel, UserRolesLevel } from 'src/common/enums';
import { CreateUserOAuthDto } from 'src/modules/auth/oauth/dto';
import { OAuthUser } from 'src/modules/auth/oauth/types';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CustomToken.APP_LOGGER) private readonly logger: AppLogger,
  ) {}

  async findAll(
    query: PaginationQueryDto,
    baseUrl: string,
  ): Promise<PaginatedUsersResponseDto> {
    const { page = 1, limit = 10 } = query;
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

  async createFromOAuthUser(oauthUser: OAuthUser): Promise<ResponseUserDto> {
    const username = await this.generateUniqueUsername({
      firstName: oauthUser.firstName,
      lastName: oauthUser.lastName,
      email: oauthUser.email,
    });
    const user = await this.userRepository.createFromOAuth({
      email: oauthUser.email,
      username: username,
      role: UserRolesLevel.USER,
      privacy: PrivacyLevel.PUBLIC,
      profile: {
        firstname: oauthUser?.firstName,
        lastname: oauthUser?.lastName,
        avatar: oauthUser?.picture,
      },
    } as CreateUserOAuthDto);
    this.logger.log(
      {
        message: 'OAuth user created.',
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

  async updateIsOAuthUser(userId: string, isOAuthUser: boolean): Promise<void> {
    const user = await this.userRepository.updateIsOAuthUser(
      userId,
      isOAuthUser,
    );
    if (user === null)
      throw new NotFoundException('User with this ID does not exists.');

    this.logger.log(
      {
        message: 'User OAuth status updated.',
        userId,
        isOAuthUser,
      },
      UserService.name,
      HttpStatus.OK,
    );
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found.');
    if (!user.password)
      throw new BadRequestException(
        'Password change not allowed for OAuth users.',
      );
    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) throw new BadRequestException('Incorrect current password.');

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    this.logger.log(
      {
        message: 'Password updated.',
        userId,
      },
      UserService.name,
      HttpStatus.OK,
    );
    await this.userRepository.changePassword(userId, hashedPassword);
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

  async checkIfUserExistsByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async checkIfUserExistsByUsername(
    username: string,
  ): Promise<UserDocument | null> {
    return this.userRepository.findByUsername(username);
  }

  async generateUniqueUsername(data: {
    firstName?: string;
    lastName?: string;
    email: string;
  }): Promise<string> {
    let baseUsername: string;

    if (data.firstName && data.lastName) {
      baseUsername = `${data.firstName}${data.lastName}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    } else {
      baseUsername = data.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    }

    if (!baseUsername || baseUsername.length < 3) {
      baseUsername = 'user';
    }

    let username = baseUsername;
    let counter = 1;

    while (await this.userRepository.findByUsername(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }
}

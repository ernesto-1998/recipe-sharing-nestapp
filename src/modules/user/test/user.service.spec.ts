import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  mockCreateUser,
  mockResponseUser,
  MockResponseUser,
  mockMongoUser,
  mockUpdatedUser,
  mockUpdateUser,
  mockUpdatedMongoUser,
  mockPaginationInfo,
  mockPaginatedUsers,
} from '../../../common/mocks/user';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { UserDocument } from '../schemas/user.schema';
import { Mapper } from 'src/common/utils/mapper';
import { ResponseUserDto } from '../dto';
import { buildPaginationInfo } from 'src/common/utils/pagination';
import { CustomToken } from 'src/common/enums/custom-tokens-providers.enum';
import { AppLogger } from 'src/common/interfaces';

jest.mock('bcrypt');

jest.mock('src/common/utils/mapper', () => ({
  Mapper: {
    toResponse: jest.fn(),
    toResponseMany: jest.fn(),
  },
}));

jest.mock('src/common/utils/pagination', () => ({
  buildPaginationInfo: jest.fn(),
}));

const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUsername: jest.fn(),
  count: jest.fn(),
};

const mockLogger: Partial<AppLogger> = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  verbose: jest.fn(),
  debug: jest.fn(),
};

const hashedPassword = 'mockHashedPassword';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: CustomToken.APP_LOGGER, useValue: mockLogger },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await module.close();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user when email and username are not taken', async () => {
      (userRepository.existsByEmail as jest.Mock).mockResolvedValue(false);
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.create as jest.Mock).mockResolvedValue(mockMongoUser);
      (Mapper.toResponse as jest.Mock).mockReturnValue(mockResponseUser);

      const result: MockResponseUser = await userService.create(mockCreateUser);

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockCreateUser.email,
      );
      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockCreateUser.username,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUser.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...mockCreateUser,
        password: hashedPassword,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        {
          message: 'User created.',
          userId: mockMongoUser._id,
        },
        UserService.name,
        HttpStatus.CREATED,
      );
      expect(Mapper.toResponse).toHaveBeenCalledWith(
        ResponseUserDto,
        mockMongoUser,
      );
      expect(result).toEqual(mockResponseUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      (userRepository.existsByEmail as jest.Mock).mockResolvedValue(true);
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(false);

      await expect(userService.create(mockCreateUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(userService.create(mockCreateUser)).rejects.toThrow(
        'User with this email already exists.',
      );

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockCreateUser.email,
      );
      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockCreateUser.username,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      (userRepository.existsByEmail as jest.Mock).mockResolvedValue(false);
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(true);

      await expect(userService.create(mockCreateUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(userService.create(mockCreateUser)).rejects.toThrow(
        'User with this username already exists.',
      );

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockCreateUser.email,
      );
      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockCreateUser.username,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      (userRepository.updateById as jest.Mock).mockResolvedValue(
        mockUpdatedMongoUser,
      );
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(false);
      (Mapper.toResponse as jest.Mock).mockReturnValue(mockUpdatedUser);

      const result: MockResponseUser = await userService.update(
        mockResponseUser._id,
        mockUpdateUser,
      );

      expect(userRepository.updateById).toHaveBeenCalledWith(
        mockResponseUser._id,
        mockUpdateUser,
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        {
          message: 'User updated.',
          userId: mockResponseUser._id,
          newValues: mockUpdateUser,
        },
        UserService.name,
        HttpStatus.OK,
      );
      expect(Mapper.toResponse).toHaveBeenCalledWith(
        ResponseUserDto,
        mockUpdatedMongoUser,
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw ConflictException if username already exists', async () => {
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(true);

      await expect(
        userService.update(mockResponseUser._id, mockUpdateUser),
      ).rejects.toThrow(ConflictException);
      await expect(
        userService.update(mockResponseUser._id, mockUpdateUser),
      ).rejects.toThrow('Username is already in use.');

      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockUpdateUser.username,
      );
      expect(userRepository.updateById).not.toHaveBeenCalled();
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(false);
      (userRepository.updateById as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.update(mockResponseUser._id, mockUpdateUser),
      ).rejects.toThrow(NotFoundException);
      await expect(
        userService.update(mockResponseUser._id, mockUpdateUser),
      ).rejects.toThrow('User with this ID does not exists.');

      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockUpdateUser.username,
      );
      expect(userRepository.updateById).toHaveBeenCalledWith(
        mockResponseUser._id,
        mockUpdateUser,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove and return the deleted user', async () => {
      (userRepository.deleteById as jest.Mock).mockResolvedValue(mockMongoUser);
      (Mapper.toResponse as jest.Mock).mockReturnValue(mockResponseUser);

      const result = await userService.remove(mockResponseUser._id);

      expect(result).toEqual(mockResponseUser);
      expect(userRepository.deleteById).toHaveBeenCalledWith(
        mockResponseUser._id,
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        {
          message: 'User deleted.',
          userId: mockResponseUser._id,
        },
        UserService.name,
        HttpStatus.OK,
      );
      expect(Mapper.toResponse).toHaveBeenCalledWith(
        ResponseUserDto,
        mockMongoUser,
      );
    });

    it('should throw NotFoundException if user to remove does not exist', async () => {
      (userRepository.deleteById as jest.Mock).mockResolvedValue(null);

      await expect(userService.remove(mockResponseUser._id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(userService.remove(mockResponseUser._id)).rejects.toThrow(
        'User with this ID does not exists.',
      );
      expect(userRepository.deleteById).toHaveBeenCalledWith(
        mockResponseUser._id,
      );
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: UserDocument[] = [mockMongoUser];
      (userRepository.findAll as jest.Mock).mockResolvedValue(users);
      (userRepository.count as jest.Mock).mockResolvedValue(1);
      (buildPaginationInfo as jest.Mock).mockReturnValue(mockPaginationInfo);
      (Mapper.toResponseMany as jest.Mock).mockReturnValue([mockResponseUser]);

      const result = await userService.findAll(
        { page: 1, limit: 10 },
        'http://localhost:5000/users',
      );

      expect(result).toEqual(mockPaginatedUsers);
      expect(userRepository.findAll).toHaveBeenCalled();
      expect(userRepository.count).toHaveBeenCalled();
      expect(Mapper.toResponseMany).toHaveBeenCalledWith(
        ResponseUserDto,
        users,
      );
      expect(buildPaginationInfo).toHaveBeenCalledWith(
        1,
        1,
        10,
        'http://localhost:5000/users',
      );
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockMongoUser);
      (Mapper.toResponse as jest.Mock).mockReturnValue(mockResponseUser);

      const result = await userService.findById(mockResponseUser._id);

      expect(result).toEqual(mockResponseUser);
      expect(userRepository.findById).toHaveBeenCalledWith(
        mockResponseUser._id,
      );
      expect(Mapper.toResponse).toHaveBeenCalledWith(
        ResponseUserDto,
        mockMongoUser,
      );
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.findById(mockResponseUser._id)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(
        mockResponseUser._id,
      );
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(
        mockMongoUser,
      );
      (Mapper.toResponse as jest.Mock).mockReturnValue(mockResponseUser);

      const result = await userService.findByUsername(
        mockResponseUser.username,
      );

      expect(result).toEqual(mockResponseUser);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        mockResponseUser.username,
      );
      expect(Mapper.toResponse).toHaveBeenCalledWith(
        ResponseUserDto,
        mockMongoUser,
      );
    });

    it('should throw NotFoundException if user is not found by username', async () => {
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.findByUsername(mockResponseUser.username),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        mockResponseUser.username,
      );
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(
        mockMongoUser,
      );
      (Mapper.toResponse as jest.Mock).mockReturnValue(mockResponseUser);

      const result = await userService.findByEmail(mockResponseUser.email);

      expect(result).toEqual(mockResponseUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        mockResponseUser.email,
      );
      expect(Mapper.toResponse).toHaveBeenCalledWith(
        ResponseUserDto,
        mockMongoUser,
      );
    });

    it('should throw NotFoundException if user is not found by email', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.findByEmail(mockResponseUser.email),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        mockResponseUser.email,
      );
      expect(Mapper.toResponse).not.toHaveBeenCalled();
    });
  });
});

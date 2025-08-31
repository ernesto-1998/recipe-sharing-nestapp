import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import {
  mockCreateUser,
  mockUser,
  MockResponseUser,
  mockMongoUser,
  mockUpdatedUser,
  mockUpdateUser,
  mockUpdatedMongoUser,
} from '../../../common/mocks';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { UserMapper } from '../user.mapper';
import { UserDocument } from '../schemas/user.schema';

jest.mock('bcrypt');

jest.mock('../user.mapper', () => ({
  UserMapper: {
    toResponse: jest.fn(),
    toResponseMany: jest.fn(),
  },
}));

const hashedPassword = 'mockHashedPassword';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

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
  };

  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
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
      (UserMapper.toResponse as jest.Mock).mockReturnValue(mockUser);

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
      expect(UserMapper.toResponse).toHaveBeenCalledWith(mockMongoUser);
      expect(result).toEqual(mockUser);
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
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
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
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      (userRepository.updateById as jest.Mock).mockResolvedValue(
        mockUpdatedMongoUser,
      );
      (userRepository.existsByEmail as jest.Mock).mockResolvedValue(false);
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(false);
      (UserMapper.toResponse as jest.Mock).mockReturnValue(mockUpdatedUser);

      const result: MockResponseUser = await userService.update(
        mockUser._id,
        mockUpdateUser,
      );

      expect(userRepository.updateById).toHaveBeenCalledWith(
        mockUser._id,
        mockUpdateUser,
      );
      expect(UserMapper.toResponse).toHaveBeenCalledWith(mockUpdatedMongoUser);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      (userRepository.existsByEmail as jest.Mock).mockResolvedValue(true);
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(false);

      await expect(
        userService.update(mockUser._id, mockUpdateUser),
      ).rejects.toThrow(ConflictException);
      await expect(
        userService.update(mockUser._id, mockUpdateUser),
      ).rejects.toThrow('Email is already in use.');

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockUpdateUser.email,
      );
      expect(userRepository.existsByUsername).not.toHaveBeenCalled();
      expect(userRepository.updateById).not.toHaveBeenCalled();
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      (userRepository.existsByEmail as jest.Mock).mockResolvedValue(false);
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(true);

      await expect(
        userService.update(mockUser._id, mockUpdateUser),
      ).rejects.toThrow(ConflictException);
      await expect(
        userService.update(mockUser._id, mockUpdateUser),
      ).rejects.toThrow('Username is already in use.');

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockUpdateUser.email,
      );
      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockUpdateUser.username,
      );
      expect(userRepository.updateById).not.toHaveBeenCalled();
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      (userRepository.existsByEmail as jest.Mock).mockResolvedValue(false);
      (userRepository.existsByUsername as jest.Mock).mockResolvedValue(false);
      (userRepository.updateById as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.update(mockUser._id, mockUpdateUser),
      ).rejects.toThrow(NotFoundException);
      await expect(
        userService.update(mockUser._id, mockUpdateUser),
      ).rejects.toThrow('User with this ID does not exists.');

      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockUpdateUser.email,
      );
      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockUpdateUser.username,
      );
      expect(userRepository.updateById).toHaveBeenCalledWith(
        mockUser._id,
        mockUpdateUser,
      );
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove and return the deleted user', async () => {
      (userRepository.deleteById as jest.Mock).mockResolvedValue(mockMongoUser);
      (UserMapper.toResponse as jest.Mock).mockReturnValue(mockUser);

      const result = await userService.remove(mockUser._id);

      expect(result).toEqual(mockUser);
      expect(userRepository.deleteById).toHaveBeenCalledWith(mockUser._id);
      expect(UserMapper.toResponse).toHaveBeenCalledWith(mockMongoUser);
    });

    it('should throw NotFoundException if user to remove does not exist', async () => {
      (userRepository.deleteById as jest.Mock).mockResolvedValue(null);

      await expect(userService.remove(mockUser._id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(userService.remove(mockUser._id)).rejects.toThrow(
        'User with this ID does not exists.',
      );
      expect(userRepository.deleteById).toHaveBeenCalledWith(mockUser._id);
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: UserDocument[] = [mockMongoUser];
      (userRepository.findAll as jest.Mock).mockResolvedValue(users);
      (UserMapper.toResponseMany as jest.Mock).mockReturnValue([mockUser]);

      const result = await userService.findAll();

      expect(result).toEqual([mockUser]);
      expect(userRepository.findAll).toHaveBeenCalled();
      expect(UserMapper.toResponseMany).toHaveBeenCalledWith(users);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockMongoUser);
      (UserMapper.toResponse as jest.Mock).mockReturnValue(mockUser);

      const result = await userService.findById(mockUser._id);

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser._id);
      expect(UserMapper.toResponse).toHaveBeenCalledWith(mockMongoUser);
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.findById(mockUser._id)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser._id);
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(
        mockMongoUser,
      );
      (UserMapper.toResponse as jest.Mock).mockReturnValue(mockUser);

      const result = await userService.findByUsername(mockUser.username);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        mockUser.username,
      );
      expect(UserMapper.toResponse).toHaveBeenCalledWith(mockMongoUser);
    });

    it('should throw NotFoundException if user is not found by username', async () => {
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.findByUsername(mockUser.username),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        mockUser.username,
      );
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(
        mockMongoUser,
      );
      (UserMapper.toResponse as jest.Mock).mockReturnValue(mockUser);

      const result = await userService.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(UserMapper.toResponse).toHaveBeenCalledWith(mockMongoUser);
    });

    it('should throw NotFoundException if user is not found by email', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(userService.findByEmail(mockUser.email)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(UserMapper.toResponse).not.toHaveBeenCalled();
    });
  });
});

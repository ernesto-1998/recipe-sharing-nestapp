// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockUser,
  mockCreateUser,
  MockResponseUser,
  mockUpdatedUser,
  mockUpdateUser,
} from './mocks';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;

  const mockUserService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      mockUserService.create.mockResolvedValue(mockUser);
      const result = await userController.create(mockCreateUser);
      expect(result).toEqual(mockUser);
      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUser);
    });

    it('should throw ConflictException if user creation fails due to conflict', async () => {
      mockUserService.create.mockRejectedValue(
        new ConflictException('User with this email already exists.'),
      );
      await expect(userController.create(mockCreateUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(userController.create(mockCreateUser)).rejects.toThrow(
        'User with this email already exists.',
      );
      expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: MockResponseUser[] = [mockUser];

      mockUserService.findAll.mockResolvedValue(users);

      const result = await userController.findAll();

      expect(result).toEqual(users);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);
      const result = await userController.findById(mockUser._id);
      expect(result).toEqual(mockUser);
      expect(mockUserService.findById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      mockUserService.findById.mockRejectedValue(
        new NotFoundException('User with this ID does not exists.'),
      );
      await expect(userController.findById(mockUser._id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(userController.findById(mockUser._id)).rejects.toThrow(
        'User with this ID does not exists.',
      );
      expect(mockUserService.findById).toHaveBeenCalledWith(mockUser._id);
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockUser);
      const result = await userController.findByUsername(mockUser.username);
      expect(result).toEqual(mockUser);
      expect(mockUserService.findByUsername).toHaveBeenCalledWith(
        mockUser.username,
      );
    });

    it('should throw NotFoundException if user is not found by username', async () => {
      mockUserService.findByUsername.mockRejectedValue(
        new NotFoundException('User with this username does not exists.'),
      );
      await expect(
        userController.findByUsername('nonExistentUser'),
      ).rejects.toThrow(NotFoundException);
      expect(mockUserService.findByUsername).toHaveBeenCalledWith(
        'nonExistentUser',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      const result = await userController.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should throw NotFoundException if user is not found by email', async () => {
      mockUserService.findByEmail.mockRejectedValue(
        new NotFoundException('User with this email does not exists.'),
      );
      await expect(
        userController.findByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      mockUserService.update.mockResolvedValue(mockUpdatedUser);

      const result = await userController.update(
        mockUpdatedUser._id,
        mockUpdateUser,
      );

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(
        mockUpdatedUser._id,
        mockUpdateUser,
      );
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      mockUserService.update.mockRejectedValue(
        new NotFoundException('User with this ID does not exists.'),
      );
      await expect(
        userController.update('nonExistentId', mockUpdateUser),
      ).rejects.toThrow(NotFoundException);
      expect(mockUserService.update).toHaveBeenCalledWith(
        'nonExistentId',
        mockUpdateUser,
      );
    });
  });

  describe('remove', () => {
    it('should remove and return the deleted user', async () => {
      mockUserService.remove.mockResolvedValue(mockUser);
      const result = await userController.remove(mockUser._id);

      expect(result).toEqual(mockUser);
      expect(mockUserService.remove).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      mockUserService.remove.mockRejectedValue(
        new NotFoundException('User with this ID does not exists.'),
      );
      await expect(userController.remove('nonExistentId')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserService.remove).toHaveBeenCalledWith('nonExistentId');
    });
  });
});

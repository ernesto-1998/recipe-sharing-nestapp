import { Test, TestingModule } from '@nestjs/testing';
import {
  mockResponseUser,
  mockUpdatedUser,
  mockUpdateUser,
  mockPaginatedUsers,
} from '../../../common/mocks/user';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { NotFoundException } from '@nestjs/common';
import { UserOwnerGuard } from 'src/common/guards/user-owner.guard';
import { Request } from 'express';
import { RequestContextService } from 'src/common/context/request-context.service';

class TestGuard {
  canActivate() {
    return true;
  }
}

const mockUserService = {
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
};

const mockRequestContextService: Partial<RequestContextService> = {
  getContext: jest.fn().mockReturnValue({
    full_url: 'http://localhost:5000/users',
    protocol: 'http',
    host: 'localhost:5000',
    path: '/users',
  }),
};

describe('UserController', () => {
  let userController: UserController;

  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    })
      .overrideGuard(UserOwnerGuard)
      .useValue(new TestGuard())
      .compile();
    userController = module.get<UserController>(UserController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await module.close();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
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
      mockUserService.remove.mockResolvedValue(mockResponseUser);
      const result = await userController.remove(mockResponseUser._id);

      expect(result).toEqual(mockResponseUser);
      expect(mockUserService.remove).toHaveBeenCalledWith(mockResponseUser._id);
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

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserService.findAll.mockResolvedValue(mockPaginatedUsers);

      const result = await userController.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockPaginatedUsers);
      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(mockRequestContextService.getContext).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      mockUserService.findById.mockResolvedValue(mockResponseUser);
      const result = await userController.findById(mockResponseUser._id);
      expect(result).toEqual(mockResponseUser);
      expect(mockUserService.findById).toHaveBeenCalledWith(
        mockResponseUser._id,
      );
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      mockUserService.findById.mockRejectedValue(
        new NotFoundException('User with this ID does not exists.'),
      );
      await expect(
        userController.findById(mockResponseUser._id),
      ).rejects.toThrow(NotFoundException);
      await expect(
        userController.findById(mockResponseUser._id),
      ).rejects.toThrow('User with this ID does not exists.');
      expect(mockUserService.findById).toHaveBeenCalledWith(
        mockResponseUser._id,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockUserService.findByUsername.mockResolvedValue(mockResponseUser);
      const result = await userController.findByUsername(
        mockResponseUser.username,
      );
      expect(result).toEqual(mockResponseUser);
      expect(mockUserService.findByUsername).toHaveBeenCalledWith(
        mockResponseUser.username,
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
      mockUserService.findByEmail.mockResolvedValue(mockResponseUser);
      const result = await userController.findByEmail(mockResponseUser.email);
      expect(result).toEqual(mockResponseUser);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        mockResponseUser.email,
      );
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
});

import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  mockResponseUser,
  mockUpdatedUser,
  mockUpdateUser,
  mockPaginatedUsers,
  mockTokenUser,
  mockChangePassword,
} from '../../../common/mocks/user';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserOwnerGuard } from 'src/common/guards/user-owner.guard';
import { RequestContextService } from 'src/common/context/request-context.service';

class TestGuard {
  canActivate() {
    return true;
  }
}

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  let requestContextService: jest.Mocked<RequestContextService>;

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      changePassword: jest.fn(),
    };

    const mockRequestContextService = {
      getContext: jest.fn().mockReturnValue({
        full_url: 'http://localhost:5000/users',
        protocol: 'http',
        host: 'localhost:5000',
        path: '/users',
      }),
    };

    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    })
      .overrideGuard(UserOwnerGuard)
      .useValue(new TestGuard())
      .compile();

    userController = module.get(UserController);
    userService = module.get(UserService);
    requestContextService = module.get(RequestContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      userService.findAll.mockResolvedValue(mockPaginatedUsers);

      const result = await userController.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        info: {
          count: 1,
          pages: 1,
          next: null,
          prev: null,
        },
        results: [mockResponseUser],
      });
      expect(userService.findAll).toHaveBeenCalled();
      expect(userService.findAll).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        'http://localhost:5000/users',
      );
      expect(requestContextService.getContext).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      userService.findById.mockResolvedValue(mockResponseUser);

      const result = await userController.findById(mockResponseUser._id);

      expect(result).toEqual({
        _id: '60f7c0e2e2a2c2a4d8e2e2a2',
        email: 'robert@example.com',
        username: 'robert123',
        role: 'user',
        profile: {},
        createdAt: mockResponseUser.createdAt,
        updatedAt: mockResponseUser.updatedAt,
      });
      expect(userService.findById).toHaveBeenCalledWith(
        '60f7c0e2e2a2c2a4d8e2e2a2',
      );
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      userService.findById.mockRejectedValue(
        new NotFoundException('User with this ID does not exists.'),
      );

      await expect(
        userController.findById(mockResponseUser._id),
      ).rejects.toThrow(NotFoundException);
      await expect(
        userController.findById(mockResponseUser._id),
      ).rejects.toThrow('User with this ID does not exists.');

      expect(userService.findById).toHaveBeenCalledWith(
        '60f7c0e2e2a2c2a4d8e2e2a2',
      );
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      userService.findByUsername.mockResolvedValue(mockResponseUser);

      const result = await userController.findByUsername(
        mockResponseUser.username,
      );

      expect(result).toEqual({
        _id: '60f7c0e2e2a2c2a4d8e2e2a2',
        email: 'robert@example.com',
        username: 'robert123',
        role: 'user',
        profile: {},
        createdAt: mockResponseUser.createdAt,
        updatedAt: mockResponseUser.updatedAt,
      });
      expect(userService.findByUsername).toHaveBeenCalledWith('robert123');
    });

    it('should throw NotFoundException if user is not found by username', async () => {
      userService.findByUsername.mockRejectedValue(
        new NotFoundException('User with this username does not exists.'),
      );

      await expect(
        userController.findByUsername('nonExistentUser'),
      ).rejects.toThrow(NotFoundException);

      expect(userService.findByUsername).toHaveBeenCalledWith(
        'nonExistentUser',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      userService.findByEmail.mockResolvedValue(mockResponseUser);

      const result = await userController.findByEmail(mockResponseUser.email);

      expect(result).toEqual({
        _id: '60f7c0e2e2a2c2a4d8e2e2a2',
        email: 'robert@example.com',
        username: 'robert123',
        role: 'user',
        profile: {},
        createdAt: mockResponseUser.createdAt,
        updatedAt: mockResponseUser.updatedAt,
      });
      expect(userService.findByEmail).toHaveBeenCalledWith(
        'robert@example.com',
      );
    });

    it('should throw NotFoundException if user is not found by email', async () => {
      userService.findByEmail.mockRejectedValue(
        new NotFoundException('User with this email does not exists.'),
      );

      await expect(
        userController.findByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);

      expect(userService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      userService.update.mockResolvedValue(mockUpdatedUser);

      const result = await userController.update(
        mockUpdatedUser._id,
        mockUpdateUser,
      );

      expect(result).toEqual(mockUpdatedUser);
      expect(userService.update).toHaveBeenCalledWith(
        mockUpdatedUser._id,
        mockUpdateUser,
      );
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      userService.update.mockRejectedValue(
        new NotFoundException('User with this ID does not exists.'),
      );

      await expect(
        userController.update('nonExistentId', mockUpdateUser),
      ).rejects.toThrow(NotFoundException);

      expect(userService.update).toHaveBeenCalledWith(
        'nonExistentId',
        mockUpdateUser,
      );
    });
  });

  describe('changePassword', () => {
    it('should change the password successfully', async () => {
      userService.changePassword.mockResolvedValue(undefined);

      const result = await userController.changePassword(
        mockTokenUser,
        mockChangePassword,
      );

      expect(userService.changePassword).toHaveBeenCalledWith(
        '60f7c0e2e2a2c2a4d8e2e2a2',
        {
          currentPassword: 'hashedPassword',
          newPassword: 'newPassword123',
        },
      );
      expect(result).toEqual({ message: 'Password successfully changed.' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      userService.changePassword.mockRejectedValue(
        new NotFoundException('User not found.'),
      );

      await expect(
        userController.changePassword(mockTokenUser, mockChangePassword),
      ).rejects.toThrow(NotFoundException);

      expect(userService.changePassword).toHaveBeenCalledWith(
        '60f7c0e2e2a2c2a4d8e2e2a2',
        {
          currentPassword: 'hashedPassword',
          newPassword: 'newPassword123',
        },
      );
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      userService.changePassword.mockRejectedValue(
        new BadRequestException('Incorrect current password.'),
      );

      await expect(
        userController.changePassword(mockTokenUser, mockChangePassword),
      ).rejects.toThrow(BadRequestException);

      expect(userService.changePassword).toHaveBeenCalledWith(
        '60f7c0e2e2a2c2a4d8e2e2a2',
        {
          currentPassword: 'hashedPassword',
          newPassword: 'newPassword123',
        },
      );
    });
  });

  describe('remove', () => {
    it('should remove and return the deleted user', async () => {
      userService.remove.mockResolvedValue(mockResponseUser);

      const result = await userController.remove(mockResponseUser._id);

      expect(result).toEqual(mockResponseUser);
      expect(userService.remove).toHaveBeenCalledWith(mockResponseUser._id);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      userService.remove.mockRejectedValue(
        new NotFoundException('User with this ID does not exists.'),
      );

      await expect(userController.remove('nonExistentId')).rejects.toThrow(
        NotFoundException,
      );

      expect(userService.remove).toHaveBeenCalledWith('nonExistentId');
    });
  });
});

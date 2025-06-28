// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';

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
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      const createUserDto: CreateUserDto = {
        email: 'robert@example.com',
        username: 'robert123',
        passwordHash: 'hashedpassword',
        role: 'user',
        profile: { name: 'Robert' },
      };

      const createdUser: ResponseUserDto = {
        _id: '1515asxsaxsaxsaxsaxsa5151x5sa',
        email: 'robert@example.com',
        username: 'robert123',
        role: 'user',
        profile: { name: 'Robert' },
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: '',
      };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await userController.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: ResponseUserDto[] = [
        {
          _id: '1515asxsaxsaxsaxsaxsa5151x5sa',
          email: 'user1@example.com',
          username: 'user1',
          role: 'user',
          profile: { name: 'User One' },
          createdAt: new Date(),
          updatedAt: new Date(),
          passwordHash: '',
        },
      ];

      mockUserService.findAll.mockResolvedValue(users);

      const result = await userController.findAll();

      expect(result).toEqual(users);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const user: ResponseUserDto = {
        _id: '1515asxsaxsaxsaxsaxsa5151x5sa',
        email: 'user1@example.com',
        username: 'user1',
        role: 'user',
        profile: { name: 'User One' },
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: '',
      };

      mockUserService.findById.mockResolvedValue(user);

      const result = await userController.findById('123');

      expect(result).toEqual(user);
      expect(mockUserService.findById).toHaveBeenCalledWith('123');
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const user: ResponseUserDto = {
        _id: '1515asxsaxsaxsaxsaxsa5151x5sa',
        email: 'user1@example.com',
        username: 'user1',
        role: 'user',
        profile: { name: 'User One' },
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: '',
      };

      mockUserService.findByUsername.mockResolvedValue(user);

      const result = await userController.findByUsername('user1');

      expect(result).toEqual(user);
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('user1');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user: ResponseUserDto = {
        _id: '1515asxsaxsaxsaxsaxsa5151x5sa',
        email: 'user1@example.com',
        username: 'user1',
        role: 'user',
        profile: { name: 'User One' },
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: '',
      };

      mockUserService.findByEmail.mockResolvedValue(user);

      const result = await userController.findByEmail('user1@example.com');

      expect(result).toEqual(user);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        'user1@example.com',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updatedUser',
      };

      const updatedUser: ResponseUserDto = {
        _id: '1515asxsaxsaxsaxsaxsa5151x5sa',
        email: 'user1@example.com',
        username: 'updatedUser',
        role: 'user',
        profile: { name: 'User One' },
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: '',
      };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await userController.update(
        '1515asxsaxsaxsaxsaxsa5151x5sa',
        updateUserDto,
      );

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(
        '1515asxsaxsaxsaxsaxsa5151x5sa',
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove and return the deleted user', async () => {
      const deletedUser: ResponseUserDto = {
        _id: '1515asxsaxsaxsaxsaxsa5151x5sa',
        email: 'user1@example.com',
        username: 'user1',
        role: 'user',
        profile: { name: 'User One' },
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordHash: '',
      };

      mockUserService.remove.mockResolvedValue(deletedUser);

      const result = await userController.remove(
        '1515asxsaxsaxsaxsaxsa5151x5sa',
      );

      expect(result).toEqual(deletedUser);
      expect(mockUserService.remove).toHaveBeenCalledWith(
        '1515asxsaxsaxsaxsaxsa5151x5sa',
      );
    });
  });
});

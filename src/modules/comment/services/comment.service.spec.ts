import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepository } from '../repositories/comment.repository';
import { UserService } from 'src/modules/user/services/user.service';
import { RecipeService } from 'src/modules/recipe/services/recipe.service';
import { CustomToken } from 'src/common/enums';
import { NotFoundException } from '@nestjs/common';

import {
  mockComment,
  mockCreateComment,
  mockUpdateComment,
  mockResponseComment,
  mockResponseUpdatedComment,
  mockPaginatedComments,
  mockCommentFilterQuery,
} from 'src/common/mocks/comment';

import { ResponseCommentDto } from '../dto';

const mockLogger = {
  log: jest.fn(),
};

const mockCommentRepository = {
  findAll: jest.fn(),
  count: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
};

const mockUserService = {
  findById: jest.fn(),
};

const mockRecipeService = {
  findById: jest.fn(),
};

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: UserService, useValue: mockUserService },
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: CustomToken.APP_LOGGER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      mockCommentRepository.findAll.mockResolvedValue([mockComment]);
      mockCommentRepository.count.mockResolvedValue(1);

      const baseUrl = 'http://localhost:5000/v1/comments';

      const result = await service.findAll(mockCommentFilterQuery, baseUrl);

      expect(result).toEqual(mockPaginatedComments);
      expect(mockCommentRepository.findAll).toHaveBeenCalled();
      expect(mockCommentRepository.count).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a comment', async () => {
      mockCommentRepository.findById.mockResolvedValue(mockComment);

      const result = await service.findById(mockComment._id);

      expect(result).toEqual(expect.any(ResponseCommentDto));
      expect(result._id).toBe(mockResponseComment._id);
    });

    it('should throw NotFoundException when not found', async () => {
      mockCommentRepository.findById.mockResolvedValue(null);

      await expect(service.findById('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a comment', async () => {
      mockUserService.findById.mockResolvedValue({ _id: mockComment.userId });
      mockRecipeService.findById.mockResolvedValue({
        _id: mockComment.recipeId,
      });

      mockCommentRepository.create.mockResolvedValue(mockComment);

      const result = await service.create({
        ...mockCreateComment,
        userId: mockComment.userId,
      });

      expect(result).toEqual(expect.any(ResponseCommentDto));
      expect(mockCommentRepository.create).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(
        service.create({ ...mockCreateComment, userId: 'ashashashash' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if recipe does not exist', async () => {
      mockUserService.findById.mockResolvedValue({ _id: mockComment.userId });
      mockRecipeService.findById.mockResolvedValue(null);

      await expect(
        service.create({ ...mockCreateComment, userId: mockComment.userId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      mockCommentRepository.updateById.mockResolvedValue(
        mockResponseUpdatedComment,
      );

      const result = await service.update(mockComment._id, mockUpdateComment);

      expect(result.text).toBe(mockUpdateComment.text);
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepository.updateById.mockResolvedValue(null);

      await expect(
        service.update('ashashashash', mockUpdateComment),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockCommentRepository.deleteById.mockResolvedValue(mockComment);

      const result = await service.remove(mockComment._id);

      expect(result._id).toBe(mockComment._id);
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockCommentRepository.deleteById.mockResolvedValue(null);

      await expect(service.remove('NOPE')).rejects.toThrow(NotFoundException);
    });
  });
});

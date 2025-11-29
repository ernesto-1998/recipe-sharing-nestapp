import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from '../services/comment.service';
import { RequestContextService } from 'src/common/context/request-context.service';
import {
  mockPaginatedComments,
  mockComment,
  mockCreateComment,
  mockUpdateComment,
  mockResponseUpdatedComment,
  mockResponseComment,
  mockCommentFilterQuery,
} from 'src/common/mocks/comment';
import { mockTokenUser } from 'src/common/mocks/user';
import { CommentOwnerGuard } from 'src/common/guards';

class TestGuard {
  canActivate() {
    return true;
  }
}

describe('CommentController', () => {
  let controller: CommentController;
  let service: CommentService;
  let requestContext: RequestContextService;

  const mockCommentService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequestContextService = {
    getContext: jest.fn().mockReturnValue({
      full_url: 'http://localhost:5000/v1/comments',
      protocol: 'http',
      host: 'localhost:5000',
      path: '/comments',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        { provide: CommentService, useValue: mockCommentService },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    })
      .overrideGuard(CommentOwnerGuard)
      .useValue(new TestGuard())
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
    requestContext = module.get<RequestContextService>(RequestContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated comments', async () => {
      mockCommentService.findAll.mockResolvedValue(mockPaginatedComments);

      const result = await controller.findAll(mockCommentFilterQuery);

      expect(requestContext.getContext).toHaveBeenCalled();
      expect(service.findAll).toHaveBeenCalledWith(
        mockCommentFilterQuery,
        'http://localhost:5000/v1/comments',
      );
      expect(result).toEqual(mockPaginatedComments);
    });
  });

  describe('findById', () => {
    it('should return a comment by ID', async () => {
      mockCommentService.findById.mockResolvedValue(mockResponseComment);

      const result = await controller.findById(mockComment._id);

      expect(service.findById).toHaveBeenCalledWith(mockComment._id);
      expect(result).toEqual(mockResponseComment);
    });
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      mockCommentService.create.mockResolvedValue(mockResponseComment);

      const result = await controller.create(mockCreateComment, mockTokenUser);

      expect(service.create).toHaveBeenCalledWith({
        ...mockCreateComment,
        userId: mockTokenUser.userId,
      });

      expect(result).toEqual(mockResponseComment);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      mockCommentService.update.mockResolvedValue(mockResponseUpdatedComment);

      const result = await controller.update(
        mockComment._id,
        mockUpdateComment,
      );

      expect(service.update).toHaveBeenCalledWith(
        mockComment._id,
        mockUpdateComment,
      );

      expect(result).toEqual(mockResponseUpdatedComment);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      mockCommentService.remove.mockResolvedValue(mockResponseComment);

      const result = await controller.remove(mockComment._id);

      expect(service.remove).toHaveBeenCalledWith(mockComment._id);
      expect(result).toEqual(mockResponseComment);
    });
  });
});

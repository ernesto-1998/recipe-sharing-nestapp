import { buildPaginationInfo } from './pagination';

describe('buildPaginationInfo', () => {
  it('should build pagination info with next and prev pages', () => {
    const result = buildPaginationInfo(50, 2, 10, '/recipes');

    expect(result).toEqual({
      count: 50,
      pages: 5,
      next: '/recipes?page=3&limit=10',
      prev: '/recipes?page=1&limit=10',
    });
  });

  it('should return next page null when on the last page', () => {
    const result = buildPaginationInfo(30, 3, 10, '/recipes');

    expect(result).toEqual({
      count: 30,
      pages: 3,
      next: null,
      prev: '/recipes?page=2&limit=10',
    });
  });

  it('should return prev page null when on the first page', () => {
    const result = buildPaginationInfo(30, 1, 10, '/recipes');

    expect(result).toEqual({
      count: 30,
      pages: 3,
      next: '/recipes?page=2&limit=10',
      prev: null,
    });
  });

  it('should handle total = 0 correctly', () => {
    const result = buildPaginationInfo(0, 1, 10, '/recipes');

    expect(result).toEqual({
      count: 0,
      pages: 0,
      next: null,
      prev: null,
    });
  });

  it('should handle case when limit is larger than total', () => {
    const result = buildPaginationInfo(5, 1, 10, '/recipes');

    expect(result).toEqual({
      count: 5,
      pages: 1,
      next: null,
      prev: null,
    });
  });

  it('should use the default basePath when not provided', () => {
    const result = buildPaginationInfo(20, 1, 10);

    expect(result).toEqual({
      count: 20,
      pages: 2,
      next: '/module?page=2&limit=10',
      prev: null,
    });
  });

  it('should correctly calculate next and prev with custom limit', () => {
    const result = buildPaginationInfo(45, 3, 15, '/items');

    expect(result).toEqual({
      count: 45,
      pages: 3,
      next: null,
      prev: '/items?page=2&limit=15',
    });
  });
});

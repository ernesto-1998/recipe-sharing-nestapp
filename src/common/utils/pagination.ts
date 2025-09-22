import { IPaginationInfo } from '../interfaces/pagination-info.interface';

export function buildPaginationInfo(
  total: number,
  page: number,
  limit: number,
  basePath = '/module',
): IPaginationInfo {
  return {
    count: total,
    pages: Math.ceil(total / limit),
    next:
      page * limit < total
        ? `${basePath}?page=${page + 1}&limit=${limit}`
        : null,
    prev: page > 1 ? `${basePath}?page=${page - 1}&limit=${limit}` : null,
  };
}

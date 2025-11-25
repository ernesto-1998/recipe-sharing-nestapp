import { IPaginationInfo } from '../interfaces/pagination-info.interface';

export function buildPaginationInfo(
  total: number,
  page: number,
  limit: number,
  basePath = '/module',
): IPaginationInfo {
  if (basePath.includes('?')) {
    const arr = basePath.split('?');
    const params = arr[1]
      .split('&')
      .filter(
        (param) => !param.startsWith('page=') && !param.startsWith('limit='),
      );
    basePath = `${arr[0]}?${params.length > 0 ? params.join('&') + '&' : ''}`;
  } else basePath = `${basePath}?`;
  return {
    count: total,
    pages: Math.ceil(total / limit),
    next:
      page * limit < total
        ? `${basePath}page=${page + 1}&limit=${limit}`
        : null,
    prev: page > 1 ? `${basePath}page=${page - 1}&limit=${limit}` : null,
  };
}

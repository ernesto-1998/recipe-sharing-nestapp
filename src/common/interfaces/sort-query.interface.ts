import { SortOrder } from '../enums/sort-order.enum';

export interface ISortQuery<T = string> {
  sortBy?: T;
  order?: SortOrder;
}

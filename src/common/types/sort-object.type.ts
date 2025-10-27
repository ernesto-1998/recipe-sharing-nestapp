import { SortOrder } from 'src/common/enums';

export type SortObject<T extends string = string> = {
  [key in T]?: 1 | -1 | SortOrder;
};

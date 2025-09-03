export interface IGenericService {
  findById: (id: string) => Promise<unknown>;
}

import { plainToInstance } from 'class-transformer';

type ClassType<T> = { new (...args: unknown[]): T };

export class Mapper {
  static toResponse<T, V extends object>(
    cls: ClassType<T>,
    entity: V & { toObject?: () => object },
  ): T {
    const plain = entity.toObject ? entity.toObject() : entity;
    return plainToInstance(cls, plain);
  }

  static toResponseMany<T, V extends object>(
    cls: ClassType<T>,
    entities: (V & { toObject?: () => object })[],
  ): T[] {
    return entities.map((e) => this.toResponse(cls, e));
  }
}

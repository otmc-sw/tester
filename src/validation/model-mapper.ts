/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
export class ModelMapper {
  static map<T extends object>(
    data: unknown,
    ModelClass: new () => T
  ): T | T[] {
    if (Array.isArray(data)) {
      return this.mapToArray(data, ModelClass);
    }
    return this.mapToClass(data, ModelClass);
  }

  static mapToClass<T extends object>(
    data: unknown,
    ModelClass: new () => T
  ): T {
    if (data === null || data === undefined) {
      throw new Error('Cannot map null or undefined to class');
    }

    if (typeof data !== 'object') {
      throw new Error('Cannot map non-object to class');
    }

    const instance = new ModelClass();
    const dataObj = data as Partial<T>;

    for (const key in instance) {
      if (key in dataObj) {
        instance[key] = dataObj[key] as T[typeof key];
      }
    }

    return instance;
  }

  static mapToArray<T extends object>(
    data: unknown,
    ModelClass: new () => T
  ): T[] {
    if (!Array.isArray(data)) {
      throw new Error('Cannot map non-array to array of classes');
    }

    return data.map((item) => this.mapToClass(item, ModelClass));
  }
}

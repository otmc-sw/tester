/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/

export class ResponseMapper {
  map<T>(data: unknown, model?: new () => T): T {
    if (model === undefined) {
      return data as T;
    }

    if (typeof data !== 'object' || data === null) {
      return data as T;
    }

    const instance = new model();
    const dataObj = data as Record<string, unknown>;
    const instanceObj = instance as Record<string, unknown>;

    for (const key in dataObj) {
      if (key in instanceObj) {
        instanceObj[key] = dataObj[key];
      }
    }

    return instance as T;
  }
}

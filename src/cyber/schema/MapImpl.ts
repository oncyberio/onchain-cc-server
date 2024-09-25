import { MapSchema } from "@colyseus/schema";

class MapImpl<T> extends Map<string, T> {
  //
  $$cInst: MapSchema<T>;

  constructor() {
    //
    super();

    this.$$cInst = new MapSchema<T>();
  }

  set(key: string, value: T) {
    this.$$cInst.set(key, (value as any).$$cInst);
    return super.set(key, value);
  }

  delete(key: string) {
    this.$$cInst.delete(key);
    return super.delete(key);
  }

  clear(): void {
    this.$$cInst.clear();
    super.clear();
  }
}

export function createMap() {
  return new MapImpl();
}

/**
 * Minimal in-memory replacement for the Mongoose models used by the
 * authentication / payment routes under test.
 *
 * It only implements the query subset actually exercised by the routes:
 * equality, dotted paths, `$or`, `$in`, `$gt`, `$gte`, `$ne`, `$exists`,
 * plus `.sort()`, `.limit()`, `.select()`, `.lean()`, `.populate()`,
 * `.save()`, `create`, `findOneAndUpdate` (with upsert) and `deleteMany`.
 */
import mongoose from 'mongoose';

type Doc = Record<string, any>;

function getPath(doc: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), doc);
}

function setPath(doc: any, path: string, value: any): void {
  const parts = path.split('.');
  let cursor = doc;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (typeof cursor[parts[i]] !== 'object' || cursor[parts[i]] === null) {
      cursor[parts[i]] = {};
    }
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = value;
}

function matchValue(actual: any, expected: any): boolean {
  if (expected instanceof RegExp) return expected.test(String(actual ?? ''));
  if (expected && typeof expected === 'object' && !Array.isArray(expected) && !(expected instanceof Date)) {
    const operators = Object.keys(expected);
    if (operators.some((op) => op.startsWith('$'))) {
      return operators.every((op) => {
        const operand = expected[op];
        switch (op) {
          case '$in':
            return (operand as any[]).some((value) =>
              value instanceof RegExp ? value.test(String(actual ?? '')) : String(value) === String(actual)
            );
          case '$nin':
            return !(operand as any[]).some((value) => String(value) === String(actual));
          case '$ne':
            return String(actual) !== String(operand);
          case '$gt':
            return actual != null && new Date(actual).getTime() > new Date(operand).getTime();
          case '$gte':
            return actual != null && new Date(actual).getTime() >= new Date(operand).getTime();
          case '$lt':
            return actual != null && new Date(actual).getTime() < new Date(operand).getTime();
          case '$exists':
            return operand ? actual !== undefined : actual === undefined;
          case '$regex':
            return new RegExp(operand, expected.$options || '').test(String(actual ?? ''));
          default:
            throw new Error(`inMemoryModel: unsupported operator ${op}`);
        }
      });
    }
    // plain object equality (rare) → compare the keys we know
    return Object.keys(expected).every((key) => String(actual?.[key]) === String(expected[key]));
  }
  if (expected === null) return actual == null;
  if (expected === undefined) return true;
  return String(actual) === String(expected);
}

function matches(doc: Doc, filter: Doc = {}): boolean {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === '$or') {
      return (expected as Doc[]).some((sub) => matches(doc, sub));
    }
    if (key === '$and') {
      return (expected as Doc[]).every((sub) => matches(doc, sub));
    }
    return matchValue(getPath(doc, key), expected);
  });
}

class Query<T> implements PromiseLike<T> {
  constructor(
    private readonly exec: () => T,
    private readonly sortSpec?: { field: string; direction: 1 | -1 },
    private readonly limitValue?: number
  ) {}

  sort(spec?: Record<string, 1 | -1> | string) {
    if (!spec || typeof spec === 'string') return this;
    const [field, direction] = Object.entries(spec)[0] || [];
    if (!field) return this;
    return new Query<T>(this.exec, { field, direction: direction as 1 | -1 }, this.limitValue);
  }

  limit(value: number) {
    return new Query<T>(this.exec, this.sortSpec, value);
  }

  skip() {
    return this;
  }

  select() {
    return this;
  }

  populate() {
    return this;
  }

  lean() {
    return this;
  }

  then<R1 = T, R2 = never>(
    onFulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
    onRejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    let value = this.exec();
    if (Array.isArray(value) && this.sortSpec) {
      const { field, direction } = this.sortSpec;
      value = [...(value as any[])].sort((a, b) => {
        const av = new Date(getPath(a, field) ?? 0).getTime();
        const bv = new Date(getPath(b, field) ?? 0).getTime();
        return (av - bv) * direction;
      }) as any;
    }
    if (Array.isArray(value) && typeof this.limitValue === 'number') {
      value = (value as any[]).slice(0, this.limitValue) as any;
    }
    return Promise.resolve(value as T).then(onFulfilled as any, onRejected as any);
  }

  catch<R = never>(onRejected?: ((reason: any) => R | PromiseLike<R>) | null): PromiseLike<T | R> {
    return this.then(undefined, onRejected);
  }
}

export class InMemoryCollection {
  docs: Doc[] = [];

  reset(seed: Doc[] = []): void {
    this.docs = seed.map((doc) => this.materialize(doc));
  }

  private materialize(data: Doc): Doc {
    const doc: Doc = { ...data };
    if (!doc._id) doc._id = new mongoose.Types.ObjectId();
    if (!doc.createdAt) doc.createdAt = new Date();
    if (!doc.updatedAt) doc.updatedAt = new Date();
    Object.defineProperty(doc, 'save', {
      enumerable: false,
      value: async () => {
        const index = this.docs.findIndex((existing) => String(existing._id) === String(doc._id));
        const stored = { ...doc, updatedAt: new Date() };
        if (index >= 0) this.docs[index] = stored;
        else this.docs.push(stored);
        return doc;
      },
    });
    Object.defineProperty(doc, 'toObject', {
      enumerable: false,
      value: () => ({ ...doc }),
    });
    return doc;
  }

  private clone(doc: Doc | null): Doc | null {
    if (!doc) return null;
    const { save, toObject, ...rest } = doc as any;
    return this.materialize(rest);
  }

  seedDoc(doc: Doc): Doc {
    const materialized = this.materialize(doc);
    this.docs.push(materialized);
    return materialized;
  }

  find(filter: Doc = {}) {
    return new Query<Doc[]>(() => this.docs.filter((doc) => matches(doc, filter)).map((d) => this.clone(d)!));
  }

  findOne(filter: Doc = {}) {
    return new Query<Doc | null>(() => {
      const found = this.docs.find((doc) => matches(doc, filter));
      return this.clone(found || null);
    });
  }

  findById(id: any) {
    return this.findOne({ _id: id });
  }

  async countDocuments(filter: Doc = {}): Promise<number> {
    return this.docs.filter((doc) => matches(doc, filter)).length;
  }

  async create(data: Doc | Doc[]): Promise<any> {
    if (Array.isArray(data)) return Promise.all(data.map((item) => this.create(item)));
    // Emulate unique index on tokenHash / email when declared by the caller.
    const doc = this.seedDoc(data);
    return doc;
  }

  async deleteMany(filter: Doc = {}): Promise<{ deletedCount: number }> {
    const before = this.docs.length;
    this.docs = this.docs.filter((doc) => !matches(doc, filter));
    return { deletedCount: before - this.docs.length };
  }

  async findOneAndUpdate(filter: Doc = {}, update: Doc = {}, options: Doc = {}): Promise<Doc | null> {
    const index = this.docs.findIndex((doc) => matches(doc, filter));

    if (index === -1) {
      if (!options.upsert) return null;
      const base: Doc = {};
      Object.entries(filter).forEach(([key, value]) => {
        if (typeof value !== 'object' || value === null || value instanceof RegExp) {
          setPath(base, key, value);
        }
      });
      Object.entries(update.$setOnInsert || {}).forEach(([key, value]) => setPath(base, key, value));
      Object.entries(update.$set || {}).forEach(([key, value]) => setPath(base, key, value));
      const created = this.seedDoc({ ...base, ...(update.$setOnInsert || {}) });
      return options.new === false ? null : created;
    }

    const target = this.docs[index];
    const previous = { ...target };
    Object.entries(update.$set || {}).forEach(([key, value]) => {
      if (value !== undefined) setPath(target, key, value);
    });
    Object.entries(update.$setOnInsert || {}).forEach(([key, value]) => {
      if (getPath(target, key) === undefined && value !== undefined) setPath(target, key, value);
    });
    Object.entries(update.$inc || {}).forEach(([key, value]) => {
      setPath(target, key, (getPath(target, key) || 0) + value);
    });
    target.updatedAt = new Date();
    if (options.new === false) return this.clone(previous);
    return this.clone(target);
  }

  async findByIdAndUpdate(id: any, update: Doc = {}, options: Doc = {}): Promise<Doc | null> {
    return this.findOneAndUpdate({ _id: id }, update, options);
  }

  async findOneAndDelete(filter: Doc = {}): Promise<Doc | null> {
    const index = this.docs.findIndex((doc) => matches(doc, filter));
    if (index === -1) return null;
    const [removed] = this.docs.splice(index, 1);
    return removed;
  }
}

export const collections = {
  magicLinkTokens: new InMemoryCollection(),
  users: new InMemoryCollection(),
  orders: new InMemoryCollection(),
  productOrders: new InMemoryCollection(),
};

export function resetCollections(): void {
  Object.values(collections).forEach((collection) => collection.reset());
}

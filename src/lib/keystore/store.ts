import { PrismaClient } from '@prisma/client';
import prisma from '../PrismaClient/db';

export interface KeyStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
}

// Standalone Postgres key store emulation
export class PostgresKeyStore implements KeyStore {
  private client: PrismaClient;
  constructor(client: PrismaClient) {
    this.client = client;
  }

  async get(key: string): Promise<string | null> {
    try {
      const res = await this.client.keyValue.findUnique({
        where: { key: key },
      });
      return res?.value ?? null;
    } catch (error) {
      console.log('err in postgres key store: get', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<boolean> {
    try {
      await this.client.keyValue.upsert({
        where: { key: key },
        create: { key: key, value: value },
        update: { value: value },
      });
      return true;
    } catch (error) {
      console.log('err in postgres key store: set', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.keyValue.delete({
        where: { key: key },
      });
      return true;
    } catch (error) {
      console.log('err in postgres key store: delete', error);
      return false;
    }
  }
}

// init the store
export function initStore(): KeyStore {
  return new PostgresKeyStore(prisma);
}

const store = initStore();
export default store;

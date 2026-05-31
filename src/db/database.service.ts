import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, Client } from 'pg';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;
  private dbInstance!: ReturnType<typeof drizzle<typeof schema>>;

  async onModuleInit() {
    try {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
      }

      const dbName = this.extractDbName(connectionString);

      await this.ensureDatabaseExists(connectionString, dbName);

      this.pool = new Pool({ connectionString });
      this.dbInstance = drizzle(this.pool, { schema });

      this.logger.log(`Connected to database "${dbName}" successfully.`);
    } catch (error: unknown) {
      this.logger.error(
        `Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException('Database connection failed');
    }
  }

  private extractDbName(connectionString: string): string {
    const url = new URL(connectionString);
    const dbName = url.pathname.replace(/^\//, '');
    return dbName || 'postgres';
  }

  private async ensureDatabaseExists(
    connectionString: string,
    dbName: string,
  ): Promise<void> {
    const url = new URL(connectionString);
    url.pathname = '/postgres';

    const client = new Client({ connectionString: url.toString() });

    try {
      await client.connect();

      const result = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName],
      );

      if (result.rows.length === 0) {
        this.logger.log(`Database "${dbName}" does not exist. Creating...`);
        await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
        this.logger.log(`Database "${dbName}" created successfully.`);
      } else {
        this.logger.log(`Database "${dbName}" already exists.`);
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to ensure database exists: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    } finally {
      await client.end();
    }
  }

  get db() {
    return this.dbInstance;
  }

  async onModuleDestroy() {
    try {
      if (this.pool) {
        await this.pool.end();
        this.logger.log('Database connection closed.');
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to close database connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Task } from '../tasks/entities/task.entity';

// Load .env file for standalone scripts (migrations, seeds)
config();

export const typeOrmConfig = (): DataSourceOptions => {
  const configService = new ConfigService();

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD') || '',
    database: configService.get<string>('DB_NAME', 'assignment_db'),
    entities: [User, Invitation, Task],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging:
      configService.get<string>('NODE_ENV') === 'development'
        ? ['error', 'warn']
        : false,
  };
};

export const AppDataSource = new DataSource({
  ...typeOrmConfig(),
  migrations: ['src/database/migrations/**/*.ts'],
} as DataSourceOptions);

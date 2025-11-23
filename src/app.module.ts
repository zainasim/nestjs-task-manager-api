import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitationsModule } from './invitations/invitations.module';
import { TasksModule } from './tasks/tasks.module';
import { User } from './users/entities/user.entity';
import { Invitation } from './invitations/entities/invitation.entity';
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'assignment_db'),
        entities: [User, Invitation, Task],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging:
          configService.get<string>('NODE_ENV') === 'development'
            ? ['error', 'warn']
            : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    InvitationsModule,
    TasksModule,
  ],
})
export class AppModule {}

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { AppDataSource } from '../../config/typeorm.config';

async function seedAdmin(): Promise<void> {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await AppDataSource.destroy();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
    });

    await userRepository.save(admin);

    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();


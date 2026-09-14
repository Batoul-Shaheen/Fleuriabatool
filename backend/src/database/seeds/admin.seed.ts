import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const adminEmail = 'admin@delivery.com';

  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin123', 10);

  const admin = userRepository.create({
    fullName: 'System Admin',
    email: adminEmail,
    phone: '0599000000',
    password: hashedPassword,
    role: UserRole.ADMIN,
    mustChangePassword: false,
  });

  await userRepository.save(admin);

  console.log('Admin created successfully.');
  console.log(`Email: ${adminEmail}`);
  console.log('Password: Admin123');
}
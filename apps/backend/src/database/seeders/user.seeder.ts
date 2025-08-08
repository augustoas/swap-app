import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Seeder, DataFactory } from 'nestjs-seeder';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<any> {
    // Create admin user
    const adminUser = this.userRepository.create({
      email: 'admin@admin.cl',
      password: 'admin',
      firstname: 'Admin',
      lastname: 'User',
      phonenumber: '+56911111111',
    });
    const swapUser = this.userRepository.create({
      email: 'swap@swap.cl',
      password: 'swap',
      firstname: 'Swap',
      lastname: 'User',
      phonenumber: '+56922222222',
    });
    const userX = this.userRepository.create({
      email: 'userx@userx.cl',
      password: 'userx',
      firstname: 'UserX',
      lastname: 'User',
      phonenumber: '+56933333333',
    });
    
    console.log(`Admin user:\nemail: ${adminUser.email}\npassword: admin\n`);
    adminUser.password = await bcrypt.hash(adminUser.password, 12);
    await this.userRepository.save(adminUser);

    console.log(`Swap user:\nemail: ${swapUser.email}\npassword: swap\n`);
    swapUser.password = await bcrypt.hash(swapUser.password, 12);
    await this.userRepository.save(swapUser);

    console.log(`UserX user:\nemail: ${userX.email}\npassword: userx\n`);
    userX.password = await bcrypt.hash(userX.password, 12);
    await this.userRepository.save(userX);
  }

  async drop(): Promise<any> {}
}

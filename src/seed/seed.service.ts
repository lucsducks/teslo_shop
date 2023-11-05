import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }
  async runSeed() {

    await this.deleteTables();
    const AdminUser = await this.insertUser();
    await this.insertProduct(AdminUser);
    return `This action returns all seed`;
  }
  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }
  private async insertUser() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      user.password  =bcrypt.hashSync(user.password, 10)

      users.push(this.userRepository.create(user));
    });
    const userDb= await this.userRepository.save(users);
    return userDb[0];
  }
  private async insertProduct(user: User) {
    const productosSeed = initialData.products;
    const insertPromise = [];
    productosSeed.forEach((product) => {
      insertPromise.push(this.productService.create(product, user));
    });
    await Promise.all(insertPromise);
    return true;
  }

}

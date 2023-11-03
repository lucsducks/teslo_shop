import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,

  ) { }
  async runSeed() {


    await this.insertProduct();
    return `This action returns all seed`;
  }
  private async insertProduct() {
    this.productService.deleteAllProducts();
    const productosSeed = initialData.products;
    const insertPromise = [];
    productosSeed.forEach((product) => {
      insertPromise.push(this.productService.create(product));
    });
    await Promise.all(insertPromise);
    return true;
  }

}

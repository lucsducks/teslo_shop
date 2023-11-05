import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly datasource: DataSource //sabe la infomracion de la bd

  ) { }
  async create(createProductDto: CreateProductDto, user:User) {
    try {
      const { images = [], ...productdetails } = createProductDto
      const product = this.productRepository.create({ ...productdetails, 
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDbException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const productos = await this.productRepository.find({ take: limit, skip: offset, relations: { images: true } });
    return productos.map(product => ({ ...product, images: product.images.map(image => image.url) }));
  }

  async findOne(term: string) {
    let producto: Product;
    if (isUUID(term)) producto = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuild = this.productRepository.createQueryBuilder('product');
      producto = await queryBuild.where('UPPER(title) =:title or slug=:slug', { title: term.toUpperCase(), slug: term.toLowerCase() }).leftJoinAndSelect('product.images', 'ProdImages').getOne();
    }
    if (!producto) throw new BadRequestException('Product not found');
    return producto;
  }
  async findOnePlain(term: string) {
    const { images, ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images = [], ...productdetails } = updateProductDto
    const producto = await this.productRepository.preload({ id, ...productdetails });

    if (!producto) throw new NotFoundException('Product not found');
    //TODO create query runner
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images.length >= 1) { // producto hace referencia a la tabla donde tiene relacion donde dice product hace referenica a nuesta tabla como esta escrita en la bd
        await queryRunner.manager.delete(ProductImage, { product: { id } }); // si no ponecos con id significa borrariamos todo
        producto.images = images.map(image => this.productImageRepository.create({ url: image }));
      }
      producto.user = user;
      await queryRunner.manager.save(producto);
      // await this.productRepository.save(producto);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDbException(error);
    }
  }

  async remove(id: string) {
    const producto = await this.findOne(id);
    this.productRepository.remove(producto);
    return `This action removes a #${id} product`;
  }
  private handleDbException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error.message);
    throw new InternalServerErrorException('Unexpected error creating product');
  }
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDbException(error);
    }
  }
}

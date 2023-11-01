import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDbException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const productos = await this.productRepository.find({ take: limit, skip: offset });
    return productos;
  }

  async findOne(term: string) {
    let producto: Product;
    if (isUUID(term)) producto = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuild = this.productRepository.createQueryBuilder();
      producto = await queryBuild.where('UPPER(title) =:title or slug=:slug', { title: term.toUpperCase(), slug: term.toLowerCase() }).getOne();
    }
    if (!producto) throw new BadRequestException('Product not found');
    return producto;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const producto = await this.productRepository.preload({ id, ...updateProductDto });
    console.log(producto);

    if (!producto) throw new NotFoundException('Product not found');
    try {

      await this.productRepository.save(producto);
      return producto;
    } catch (error) {
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
}

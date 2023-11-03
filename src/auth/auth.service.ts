import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt'

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { isUUID } from 'class-validator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...data } = createUserDto;
      const user = this.userRepository.create({ ...data, password: bcrypt.hashSync(password, 10) }); //preprara para insertar
      console.log(user);
      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDbException(error);
    }
    return 'This action adds a new auth';
  }
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email }, select: { email: true, password: true } });
    if (!user) throw new UnauthorizedException('Credentials not valid');
    if(!bcrypt.compareSync(password,user.password)) throw new UnauthorizedException('Credentials not valid');
    return user;
  }

  findAll() {
    return `This action returns all auth`;
  }

  async findOne(term: string) {
    let user: User;
    if (isUUID(term)) user = await this.userRepository.findOneBy({ id: term });
    else {
      const queryBuild = this.userRepository.createQueryBuilder();
      user = await queryBuild.where('UPPER(email) =:email or fullname=:fullname', { email: term.toUpperCase(), fullname: term.toLowerCase() }).getOne();
    }
    if (!user) throw new BadRequestException('User not found');

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
  private handleDbException(error: any) {
    this.logger.error(`Database error occurred: ${error.code}: ${error.detail || error.message}`);

    switch (error.code) {
      case '23505': // Unique violation
        throw new ConflictException(`A record with the provided details already exists.`);
      case '23502': // Not null violation
        throw new BadRequestException('Missing required fields.');
      case '23503': // Foreign key violation
        throw new NotFoundException('Related record not found.');
      case '22P02': // Invalid text representation (e.g., UUID malformed)
        throw new BadRequestException('Invalid data format.');
      case '42P01': // Undefined table
        throw new InternalServerErrorException('A server error occurred.');
      // Add more cases as needed
      default:
        throw new InternalServerErrorException('Unexpected error occurred.');
    }
  }
}

import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {
    @ApiProperty({
        example: '8f52dccf-41e6-4b7a-ba43-a9c2cfe8b3c8'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text', {
        unique: true
    })
    @ApiProperty()

    title: string;
    @Column('float', {
        default: 0
    })
    @ApiProperty()
    price: number;
    @Column({ type: 'text', nullable: true })
    @ApiProperty()
    description: string;
    @Column('text', { unique: true })
    @ApiProperty()
    slug: string;
    @Column('int', { default: 0 })
    @ApiProperty()

    stock: number;
    @Column('text', { array: true })
    @ApiProperty()

    sizes: string[];
    @Column('text')
    @ApiProperty()

    genders: string;

    @Column({
        type: 'text',
        array: true,
        default: []
    })
    @ApiProperty()

    tags: string[];
    //eager solo funciona para funciones con find*
    @OneToMany(() => ProductImage, (productImage) => productImage.product, { cascade: true, eager: true })
    @ApiProperty()

    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }) //eager indica toda la relacion
    user: User;
    @BeforeInsert()
    updateSlugOnInsert() {
        if (!this.slug) this.slug = this.title;
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }
    @BeforeUpdate()
    updateSlugOnUpdate() {
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }
}

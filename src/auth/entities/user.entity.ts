import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text', { unique: true })
    email: string;
    @Column('text', { select: false })
    password: string;
    @Column('text')
    fullname: string;
    @Column({ type: 'bool', default: true })
    isActive: boolean;
    @Column('text', { array: true, default: ['user'] })
    roles: string[];
    @OneToMany(() => Product, (product) => product.user, { cascade: true })
    product?: Product;



    @BeforeInsert()
    @BeforeUpdate()
    checkfielemail() {
        this.email = this.email.toLowerCase().trim();
    }
    // @Column({ type: "date" })
    // createdAt: Date;
    // @Column({ type: "date" })
    // updatedAt: Date;
}

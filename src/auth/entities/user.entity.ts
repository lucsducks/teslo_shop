import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text', { unique: true })
    email: string;
    @Column('text',{select:false})
    password: string;
    @Column('text')
    fullname: string;
    @Column({ type: 'bool', default: true })
    isActive: boolean;
    @Column('text', { array: true, default: ['user'] })
    roles: string[];
    // @Column({ type: "date" })
    // createdAt: Date;
    // @Column({ type: "date" })
    // updatedAt: Date;
}

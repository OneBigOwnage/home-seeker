import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Home from './Home';

@Entity()
export default class Realtor extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 200, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    webAddress: string;

    @OneToMany(type => Home, home => home.realtor)
    homes: Array<Home>;
}

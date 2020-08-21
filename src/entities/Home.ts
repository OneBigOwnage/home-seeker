import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { PriceType } from '../contracts/HomeInformation';
import { StatusType } from '../enums/StatusType';
import Realtor from './Realtor';
import HomeStatus from './HomeStatus';

@Entity()
export default class Home extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', unique: true })
    googlePlaceID: string;

    @Column({ type: 'text'})
    street: string;

    @Column({ type: 'text'})
    number: string;

    @Column({ type: 'text'})
    city: string;

    @Column({ type: 'text'})
    zipcode: string;

    @Column({ type: 'text'})
    price: number;

    @Column({ type: 'text'})
    priceType: PriceType;

    @Column({ type: 'text'})
    currentStatus: StatusType;

    @Column({ type: 'text'})
    url: string;

    @ManyToOne(type => Realtor, realtor => realtor.homes, { nullable: false })
    realtor: Realtor;

    @OneToMany(type => HomeStatus, status => status.home)
    previousStatusses: Array<HomeStatus>;
}

import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PriceType } from '../contracts/HomeInformation';
import { Status } from '@googlemaps/google-maps-services-js';
import { StatusType } from '../enums/StatusType';
import Realtor from './Realtor';

@Entity()
export default class Home extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text'})
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

    @ManyToOne(type => Realtor, realtor => realtor.homes)
    realtor: Realtor;

    previousStatusses: Array<Status>;
}

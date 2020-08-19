import StatusType from "../enums/StatusType";
import Realtor from "../enums/Realtor";

export interface Address {
    googlePlaceID: string;
    street: string;
    number: string;
    city: string;
    zipcode: string;
}

export interface Status {
    startDate: Date | null;
    endDate: Date | null;
    type: StatusType;
}

export interface RealtorObject {
    price: number;
    status: StatusType;
    url: string;
    realtor: Realtor;
    previousStatusses: Array<Status>;
}

export type PriceType = 'TransferTax' | 'RegisteredFreely';

export default class Home implements Address, RealtorObject {
    googlePlaceID: string;
    street: string;
    number: string;
    city: string;
    zipcode: string;
    price: number;
    priceType: PriceType;
    status: StatusType;
    previousStatusses: Array<Status>;
    url: string;
    realtor: Realtor;
}

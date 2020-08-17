import StatusType from "src/enums/StatusType";
import Realtor from "src/enums/Realtor";

export default interface LegacyHomeInformation {
    address: string;
    price: string;
    status: StatusType;
    url: string;
    realtor: Realtor;
}

export interface Address {
    googlePlaceID: string;
    street: string;
    number: string;
    city: string;
    zipcode: string;
}

interface Status {
    startDate: Date | null;
    endDate: Date | null;
    type: StatusType;
}

interface RealtorObject {
    price: number;
    status: StatusType;
    url: string;
    realtor: Realtor;
    previousStatusses: Array<Status>;
}


export class Home implements Address, RealtorObject {
    googlePlaceID: string;
    street: string;
    number: string;
    city: string;
    zipcode: string;
    price: number;
    priceType: 'TransferTax' | 'RegisteredFreely';
    status: StatusType;
    previousStatusses: Array<Status>;
    url: string;
    realtor: Realtor;
}

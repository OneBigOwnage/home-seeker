import Status from "src/enums/Status";
import Realtor from "src/enums/Realtor";

export default interface HomeInformation {
    address: string;
    price: string;
    status: Status;
    url: string;
    realtor: Realtor;
}

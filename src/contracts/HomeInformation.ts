import Status from "src/constants/Status";
import Realtor from "src/constants/Realtor";

export default interface HomeInformation {
    address: string;
    price: string;
    status: Status;
    url: string;
    realtor: Realtor;
}

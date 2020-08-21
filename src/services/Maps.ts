import { Client, AddressComponent, AddressType, GeocodingAddressComponentType } from '@googlemaps/google-maps-services-js';
import { Address } from '../contracts/HomeInformation';
import { RedisClient } from '../typings';
import { sha1 } from '../Utils';


export default class Maps {

    private cache: RedisClient;
    private client: Client;
    private apiKey: string;

    constructor(client: Client, cache: RedisClient, apiKey: string) {
        this.cache = cache;
        this.apiKey = apiKey;
        this.client = client;
    }

    public async findAddress(query: string): Promise<Address> {
        return await this.placeIDToAddress(
            await this.findPlaceID(query)
        );
    }

    public async findPlaceID(query: string): Promise<string> {
        try {
            const cachedValue: string = await this.cache.get(this.key('findPlaceID', query)) as any as string;

            if (cachedValue) {
                console.debug(` [x] Cache hit for [${query}]:`);

                return cachedValue;
            }

            console.debug(` [x] Cache miss for [${query}]`);

            const searchResponse = await this.client.textSearch({
                params: { key: this.apiKey, query }
            });

            if (searchResponse.data.results.length > 1) {
                console.log(`We found ${searchResponse.data.results.length} places for [${query}] but we're only processing the first one:`);
                searchResponse.data.results.forEach(p => console.log(`\t- Found: ${p.formatted_address}.`));
            }

            const placeID: string = searchResponse.data.results[0].place_id;

            await this.cache.set(this.key('findPlaceID', query), placeID);

            return placeID;
        } catch (error) {
            console.error('An error occurred while trying to find an address using the Google Places API. Full error below:\n', error);
        }
    }

    public async placeIDToAddress(placeID: string): Promise<Address> {
        try {
            const cachedValue: string = await this.cache.get(this.key('placeIDToAddress', placeID)) as any as string;

            if (cachedValue) {
                console.debug(` [x] Cache hit for [${placeID}]:`);

                return JSON.parse(cachedValue) as Address;
            }

            console.debug(` [x] Cache miss for [${placeID}]`);

            const detailsResponse = await this.client.placeDetails({
                params: {
                    key: this.apiKey,
                    place_id: placeID
                }
            });

            const address: Address = { googlePlaceID: placeID, ...this.interpretComponents(detailsResponse.data.result.address_components) };

            await this.cache.set(this.key('placeIDToAddress', placeID), JSON.stringify(address));

            return address;
        } catch (error) {
            console.error('An error occurred while trying to find the details of a place using the Google Places API. Full error below:\n', error);
        }
    }

    private interpretComponents(components: Array<AddressComponent>): { street: string, number: string, city: string, zipcode: string } {

        let street: string;
        let number: string;
        let city: string;
        let zipcode: string;

        for (const component of components) {
            if (component.types.includes(AddressType.postal_code)) {
                zipcode = component.long_name;
            } else if (component.types.includes(AddressType.administrative_area_level_2)) {
                city = component.long_name;
            } else if (component.types.includes(AddressType.route)) {
                street = component.long_name;
            } else if (component.types.includes(GeocodingAddressComponentType.street_number)) {
                number = component.long_name;
            }
        }

        return {
            street, number, city, zipcode
        };
    }

    private key(type: 'findPlaceID' | 'placeIDToAddress', query: string) {
        return ['MAPS_CACHE', type, sha1(query)].join(':');
    }
}

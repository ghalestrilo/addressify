import { Address } from '../model/address';

export type AddressInfoType = 'valid' | 'corrected' | 'unverifiable';

const postal = require('node-postal');

type PostalAddressReturn = {
  value: string;
  component: string;
}[];

export type AddressInfo = {
  address: Address;
  type: AddressInfoType;
};

export const parseAddress = (address: string): AddressInfo | Error => {
  try {
    const data: PostalAddressReturn = postal.parser.parse_address(address);

    const addressKeyPairs: Array<[string, string]> = data.map(
      ({ value, component }) => [component, value],
    );
    const addressData = Object.fromEntries(addressKeyPairs);
    const addressResponseInfo = {
      street: addressData.road,
      number: parseInt(addressData.house_number),
      city: addressData.city,
      state: addressData.state,
      zip: parseInt(addressData.postcode),
    };

    return {
      address: addressResponseInfo,
      type: getAdressInfoType(address, addressData['display_name']),
    };
  } catch (error) {
    console.error(error);
    return new Error('Invalid address');
  }
};

const getAdressInfoType = (
  addressString: string,
  addressResponseString: string,
): AddressInfoType => {
  if (addressString === addressResponseString) {
    return 'valid';
  }
  return 'corrected';
};

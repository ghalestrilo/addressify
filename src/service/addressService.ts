import { Address } from '../model/address';
// import postal from 'node-postal';
const postal = require('node-postal');

type PostalAddressReturn = {
  value: string;
  component: string;
}[];

export const parseAddress = (address: string): Address | Error => {
  // const data = addresser.parseAddress(address);
  const data: PostalAddressReturn = postal.parser.parse_address(address);

  console.log(data);

  const addressKeyPairs: Array<[string, string]> = data.map(
    ({ value, component }) => [component, value],
  );
  const addressData = Object.fromEntries(addressKeyPairs);

  console.log(addressData);

  try {
    return {
      street: addressData.road,
      number: parseInt(addressData.house_number),
      city: addressData.city,
      state: addressData.state,
      zip: parseInt(addressData.postcode),
    };
  } catch (error) {
    console.error(error);
    return new Error('Invalid address');
  }
};

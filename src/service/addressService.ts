import { Address } from '../model/address';

export const parseAddress = (address: string): Address | Error => {
  const [street, number, city, state, zip] = address.split(', ');
  return {
    street,
    number: parseInt(number),
    city,
    state,
    zip: parseInt(zip),
  };
};

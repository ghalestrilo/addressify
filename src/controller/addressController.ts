import { parseAddress } from '../service/addressService';
import { fetchAddressData } from '../service/openStreetMapService';
import { Request, Response } from 'express';

export const validateAddress = async (
  req: Request<any, any, { address?: string }>,
  res: Response,
) => {
  try {
    const address = req.body?.address;

    if (!address) {
      return res.status(400).json({
        error: 'Address is required',
      });
    }

    if (typeof address !== 'string') {
      return res.status(400).json({
        error: 'Address is required and must be a string',
      });
    }

    const osmData = await fetchAddressData(address);
    const parsedAddress = parseAddress(address);

    if (parsedAddress instanceof Error) {
      return res.status(400).json({
        error: parsedAddress,
      });
    }

    res.json({
      success: true,
      parsed: parsedAddress,
      osm_results: osmData,
    });
  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

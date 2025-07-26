import {
  fetchAddressData,
  parseAddress,
} from '../service/openStreetMapService';
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

    if (!osmData) {
      return res.status(404).json({
        error: 'Address not found',
        addressType: 'unverifiable',
      });
    }

    const parsedAddress = parseAddress(osmData, address);

    if (parsedAddress instanceof Error) {
      return res.status(500).json({
        error: parsedAddress,
        addressType: 'unverifiable',
      });
    }

    res.json({
      success: true,
      address: parsedAddress.address,
      addressType: parsedAddress.type,
    });
  } catch (error) {
    console.error('Error validating address:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

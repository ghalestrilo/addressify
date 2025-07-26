import express from 'express';
import { parseAddress } from './service/addressService';
import { fetchAddressData } from './service/openStreetMapService';
import { hello } from './service/hello';
import { Address } from './model/address';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: hello() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/parse-address', (req, res) => {
  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        error: 'Address is required and must be a string',
      });
    }

    const result = parseAddress(address);

    if (result instanceof Error) {
      return res.status(400).json({
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error parsing address:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.get('/parse-address/:address', (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        error: 'Address parameter is required',
      });
    }

    const result = parseAddress(decodeURIComponent(address));

    if (result instanceof Error) {
      return res.status(400).json({
        error: result.message,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error parsing address:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.post('/validate-address', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        error: 'Address is required and must be a string',
      });
    }

    const osmData = await fetchAddressData(address);
    const parsedAddress = parseAddress(address);

    if (parsedAddress instanceof Error) {
      return res.status(400).json({
        error: parsedAddress.message,
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
});

app.get('/validate-address/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        error: 'Address parameter is required',
      });
    }

    const decodedAddress = decodeURIComponent(address);
    const osmData = await fetchAddressData(decodedAddress);
    const parsedAddress = parseAddress(decodedAddress);

    if (parsedAddress instanceof Error) {
      return res.status(400).json({
        error: parsedAddress.message,
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
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
    });
  },
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

app.listen(port, () => {
  console.log(`Addressify API listening on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/health`);
});

export default app;

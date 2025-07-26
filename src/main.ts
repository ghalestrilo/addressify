import express from 'express';
import { hello } from './service/hello';
import * as addressController from './controller/addressController';

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

app.post('/validate-address', addressController.validateAddress);

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

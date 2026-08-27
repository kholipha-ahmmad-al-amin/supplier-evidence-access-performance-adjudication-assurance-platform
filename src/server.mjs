import { resolve } from 'node:path';
import { createApp } from './app.mjs';
import { AccessPerformanceAdjudicationService } from './domain.mjs';
import { AtomicStore } from './store.mjs';

const portValue = process.env.PORT ?? '65060';
const port = Number(portValue);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error('PORT must be an integer from 1024 through 65535');
  process.exit(1);
}

const service = new AccessPerformanceAdjudicationService(new AtomicStore(resolve('data/access-performance-adjudication-reviews.json')));
const server = createApp(service).listen(port, '0.0.0.0', () => console.log(`access-performance adjudication assurance service listening on 0.0.0.0:${port}`));
const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

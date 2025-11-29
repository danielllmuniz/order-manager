import { env } from '../../env/index';
import { app, initializeApp } from './express';

const port: number = Number(env.PORT) || 3000;

async function startServer(): Promise<void> {
  try {
    await initializeApp();

    app.listen(port, () => {
      console.log(`\n✓ Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

import mongoose from 'mongoose';

export interface MongoDBConfig {
  uri: string;
  options?: any;
}

export class MongoDBConnection {
  static async connect(config: MongoDBConfig): Promise<void> {
    try {
      const defaultOptions = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      };

      await mongoose.connect(config.uri, {
        ...defaultOptions,
        ...(config.options || {}),
      });
      console.log('MongoDB connected successfully');
    } catch (error: any) {
      console.error('MongoDB connection error:', error.message);
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
  }

  static async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected successfully');
    } catch (error: any) {
      console.error('MongoDB disconnection error:', error.message);
      throw new Error(
        `Failed to disconnect from MongoDB: ${error.message}`,
      );
    }
  }

  static getConnectionStatus(): boolean {
    return mongoose.connection.readyState === 1;
  }

  static getConnectionUrl(): string {
    return mongoose.connection.host || 'Not connected';
  }
}

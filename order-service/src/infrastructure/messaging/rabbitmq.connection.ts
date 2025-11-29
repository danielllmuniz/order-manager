import amqp, { Channel } from 'amqplib';

export interface RabbitMQConfig {
  uri: string;
}

export class RabbitMQConnection {
  private static connection: any = null;
  private static channel: Channel | null = null;

  static async connect(config: RabbitMQConfig): Promise<void> {
    try {
      this.connection = await amqp.connect(config.uri);
      this.channel = await this.connection.createChannel();

      await this.setupQueues();
    } catch (error: any) {
      throw new Error(`Failed to connect to RabbitMQ: ${error.message}`);
    }
  }

  private static async setupQueues(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    try {
      const exchangeName = 'orders.events';
      await this.channel.assertExchange(exchangeName, 'topic', {
        durable: true,
      });

      const queues = [
        'order.status.changed',
        'order.created',
      ];

      for (const queueName of queues) {
        const queue = await this.channel.assertQueue(queueName, {
          durable: true,
        });

        const routingPattern = queueName;

        await this.channel.bindQueue(
          queue.queue,
          exchangeName,
          routingPattern,
        );
      }

      console.log('RabbitMQ queues and exchanges configured');
    } catch (error: any) {
      console.error('RabbitMQ queue setup error:', error.message);
      throw new Error(`Failed to setup RabbitMQ queues: ${error.message}`);
    }
  }

  static async publish(
    exchangeName: string,
    routingKey: string,
    message: any,
  ): Promise<void> {
    console.log('\n [RabbitMQ.publish] Starting message publish...');
    console.log(`   Exchange: ${exchangeName}`);
    console.log(`   Routing Key: ${routingKey}`);
    console.log(`   Message: ${JSON.stringify(message)}`);

    if (!this.channel) {
      console.error('[RabbitMQ.publish] Channel is null/undefined!');
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      console.log(`   Buffer Size: ${messageBuffer.length} bytes`);
      console.log('   Publishing message with options: persistent=true, contentType=application/json');

      const publishResult = this.channel.publish(exchangeName, routingKey, messageBuffer, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });

      console.log(`   Publish result: ${publishResult}`);
      console.log(
        `Message published to ${exchangeName} with routing key ${routingKey}`,
      );
      console.log('[RabbitMQ.publish] Message successfully queued for delivery\n');
    } catch (error: any) {
      console.error('[RabbitMQ.publish] Error publishing message:', error.message);
      console.error(`Stack: ${error.stack}`);
      throw new Error(`Failed to publish message: ${error.message}`);
    }
  }

  static async consume(
    queueName: string,
    callback: (message: any) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.consume(
        queueName,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              await callback(content);
              this.channel!.ack(msg);
              console.log(`Message consumed from ${queueName}`);
            } catch (error) {
              console.error('Error processing message:', error);
              this.channel!.nack(msg, false, true); // Requeue
            }
          }
        },
        { noAck: false },
      );

      console.log(`Consuming messages from queue ${queueName}`);
    } catch (error: any) {
      console.error('Error consuming messages:', error.message);
      throw new Error(`Failed to consume messages: ${error.message}`);
    }
  }

  static async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await (this.connection as any).close();
      }
      console.log('RabbitMQ disconnected successfully');
    } catch (error: any) {
      console.error('RabbitMQ disconnection error:', error.message);
      throw new Error(`Failed to disconnect from RabbitMQ: ${error.message}`);
    }
  }

  static getConnection(): any {
    return this.connection;
  }

  static getChannel(): Channel | null {
    return this.channel;
  }
}

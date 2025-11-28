import * as amqp from 'amqplib/callback_api';

describe('RabbitMQ Connection - Integration Tests', () => {
  it('should connect to RabbitMQ and verify connection state', (done) => {
    const rabbitMqUri = process.env.RABBITMQ_URI || 'amqp://admin:admin@localhost:5672';

    let connection: amqp.Connection | null = null;
    let channel: amqp.Channel | null = null;

    amqp.connect(
      rabbitMqUri,
      (err, conn) => {
        if (err) {
          console.log('RabbitMQ not available - skipping connection test');
          console.log('Start RabbitMQ with: docker-compose up -d rabbitmq');
          done();
          return;
        }

        connection = conn;
        expect(connection).toBeDefined();

        connection.createChannel((err, ch) => {
          if (err) {
            connection?.close();
            done(err);
            return;
          }

          channel = ch;
          expect(channel).toBeDefined();

          // Test exchange creation
          channel.assertExchange('test-exchange', 'topic', { durable: true }, (err) => {
            if (channel) {
              channel.close(() => {
                if (connection) {
                  connection.close(() => {
                    done(err);
                  });
                } else {
                  done(err);
                }
              });
            }
          });
        });
      },
    );
  }, 10000);
});

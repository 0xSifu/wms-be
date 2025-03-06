export default () => ({
  port: parseInt(process.env.PORT, 10) || 9001,
  rmq: {
    uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
    transaction: process.env.RABBITMQ_TRANSACTION_QUEUE || 'transaction_queue',
    tag: process.env.RABBITMQ_TAG_QUEUE || 'tag_queue'
  }
}); 
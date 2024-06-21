const fastify = require('fastify')();
const hash = require('../hash');

fastify.get('/hash', async (request, reply) => {
    const result = hash();
    return { result };
});

fastify.get('/health', async (request, reply) => {
    return { data: 'Server is healthy' }
})

fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`);
})

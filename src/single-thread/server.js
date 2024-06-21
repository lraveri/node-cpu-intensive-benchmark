const fastify = require('fastify')();
const hash = require('../hash');

fastify.get('/hash/:number', async (request, reply) => {
    const number = parseInt(request.params.number, 10);
    const result = hash('random_password', number);
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

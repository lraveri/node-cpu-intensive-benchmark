const fastify = require('fastify')();
const path = require('path');
const {Piscina} = require('piscina');
const os = require('os');
const {Worker, isMainThread, parentPort} = require('worker_threads');
const hash = require('../hash');

const numCPUs = os.cpus().length;

const pool = new Piscina({
    filename: path.resolve(__dirname, 'worker.js'),
    minThreads: numCPUs,
    maxThreads: numCPUs
});

fastify.get('/hash', async (request, reply) => {
    try {
        const result = await pool.runTask({});
        reply.send({result});
    } catch (error) {
        reply.status(500).send({error: error.message});
    }
});

fastify.get('/health', async (request, reply) => {
    return {data: 'Server is healthy'};
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});


const fastify = require('fastify')();
const { Worker, isMainThread, parentPort } = require('worker_threads');
const path = require('path');
const os = require('os');
const hash = require('../hash');

const numCPUs = os.cpus().length;

if (isMainThread) {
    const workerPool = [];
    for (let i = 0; i < numCPUs; i++) {
        workerPool.push(new Worker(path.resolve(__dirname, 'server.js')));
    }

    fastify.get('/hash', (request, reply) => {
        const wk = workerPool.pop();
        if (wk) {
            const listener = (result) => {
                wk.off('message', listener);
                workerPool.push(wk);
                reply.send({ result });
            };
            wk.on('message', listener);
            wk.postMessage({});
        } else {
            reply.status(503).send({ error: 'No available worker threads' });
        }
    });

    fastify.get('/health', (request, reply) => {
        reply.send({ data: 'Server is healthy' });
    });

    fastify.listen({ port: 3000 }, (err, address) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
} else {
    parentPort.on('message', () => {
        const result = hash();
        parentPort.postMessage(result);
    });
}

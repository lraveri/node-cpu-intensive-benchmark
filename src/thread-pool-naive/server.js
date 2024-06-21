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
    //console.log(`Created ${workerPool.length} worker threads`);

    fastify.get('/hash/:number', (request, reply) => {
        const number = parseInt(request.params.number, 10);
        //console.log(`[Main Thread] Received request for Fibonacci of ${number}`);

        const wk = workerPool.pop();
        if (wk) {
            const listener = (result) => {
                wk.off('message', listener);
                workerPool.push(wk);
                //console.log(`[Main Thread] Responding with result: ${result}`);
                reply.send({ result });
            };
            wk.on('message', listener);
            wk.postMessage(number);
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
    parentPort.on('message', (number) => {
        const result = hash('random_password', number);
        parentPort.postMessage(result);
    });
}

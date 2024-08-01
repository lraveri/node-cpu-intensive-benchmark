const fastify = require('fastify')();
const {Worker, isMainThread, workerData, parentPort} = require('worker_threads');
const path = require('path');
const hash = require('../hash');

if (isMainThread) {
    fastify.get('/hash', (request, reply) => {

        const worker = new Worker(path.resolve(__dirname, 'server.js'));

        worker.on('message', (result) => {
            reply.send({result});
        });

        worker.on('error', (error) => {
            reply.status(500).send({error: 'Worker error'});
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                reply.status(500).send({error: 'Worker stopped with exit code ' + code});
            }
        });
    });

    fastify.get('/health', (request, reply) => {
        reply.send({data: 'Server is healthy'});
    });

    fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
} else {
    const result = hash();
    parentPort.postMessage(result);
}

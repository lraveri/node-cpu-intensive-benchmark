const fastify = require('fastify')();
const {Worker, isMainThread, workerData, parentPort} = require('worker_threads');
const path = require('path');
const hash = require('../hash');

if (isMainThread) {
    fastify.get('/hash/:number', (request, reply) => {
        const number = parseInt(request.params.number, 10);
        //console.log(`[Main Thread] Received request for Fibonacci of ${number}`);

        const worker = new Worker(path.resolve(__dirname, 'server.js'), {
            workerData: {number: number}
        });

        worker.on('message', (result) => {
            //console.log(`[Main Thread] Responding with result: ${result}`);
            reply.send({result});
        });

        worker.on('error', (error) => {
            //console.error(`[Main Thread] Worker error: ${error}`);
            reply.status(500).send({error: 'Worker error'});
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                //console.error(`[Main Thread] Worker stopped with exit code ${code}`);
                reply.status(500).send({error: 'Worker stopped with exit code ' + code});
            }
        });
    });

    fastify.get('/health', (request, reply) => {
        reply.send({data: 'Server is healthy'});
    });

    fastify.listen({port: 3000}, (err, address) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
} else {
    const result = hash('random_password', workerData.number);
    parentPort.postMessage(result);
}

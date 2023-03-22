import { Injectable } from '@nestjs/common';
import { Cluster } from 'cluster';
import * as os from 'os';
const cluster: Cluster = require('node:cluster');

/**
 * Only Unix, Linux or macOS
 * cluster.schedulingPolicy = cluster.SCHED_RR
 */

const numCPUs = os.cpus().length;

@Injectable()
export class ClusterService {
    static clusterize(callback: Function): void {
        if (cluster.isPrimary) {
            console.log(`Master server started on ${process.pid}`);
            for (let i = 0; i < numCPUs / 4; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died. Restarting`);
                cluster.fork();
            });
        } else {
            console.log(`Cluster server started on ${process.pid}`);
            callback();
        }
    }
}

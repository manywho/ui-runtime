declare module '*.svg';

declare module 'worker-loader?inline=true&name=js/worker.js!*' {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}

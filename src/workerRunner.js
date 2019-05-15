export default class WorkerRunner {
    constructor(script, st, ed) {
        this.worker = new Worker(script)
        this.st = st
        this.ed = ed
    }

    postMessage(message) {
        return new Promise((resolve, reject) => {
            this.worker.onmessage = resolve
            this.worker.onerror = reject
            this.worker.postMessage({ ...message, st: this.st, ed: this.ed })
        })
    }
}

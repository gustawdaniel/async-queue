export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export class AbortToken {
    private readonly abortSymbol = Symbol('cancelled')
    private readonly abortPromise: Promise<any>
    private resolve!: Function // Works due to promise init

    constructor() {
        this.abortPromise = new Promise((resolve) => {
            this.resolve = resolve
        })
    }

    public async wrap<T>(p: PromiseLike<T>): Promise<T> {
        const result = await Promise.race([p, this.abortPromise])
        if (result === this.abortSymbol) {
            throw new Error('aborted')
        }

        return result
    }

    public abort() {
        this.resolve(this.abortSymbol)
    }
}

export interface Queue<T> {
    state: 'open' | 'closed'

    push(item: T): void

    pull(): Promise<T>

    start(): void

    stop(): void

    [Symbol.asyncIterator](): AsyncIterator<T>
}

export class Index<T> implements Queue<T> {
    state: 'open' | 'closed' = 'closed'
    private queue: T[] = []
    private waiting: ((item: T) => void)[] = []

    private readonly processor: (item: T) => Promise<void>

    constructor(processor: (item: T) => Promise<void>) {
        this.processor = processor
    }

    push(item: T): void {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift()
            if (resolve) resolve(item)
        } else {
            this.queue.push(item)
        }
    }

    async pull(): Promise<T> {
        if (this.queue.length > 0) {
            return this.queue.shift() as T
        } else {
            return await new Promise<T>((resolve) => {
                this.waiting.push(resolve)
            })
        }
    }

    async *[Symbol.asyncIterator](): AsyncGenerator<T> {
        while (true) {
            yield await this.pull()
        }
    }

    async next(): Promise<IteratorResult<T>> {
        const value = await this.pull()
        return { value, done: false }
    }

    async return(value?: T | PromiseLike<T>): Promise<IteratorResult<T>> {
        while (this.waiting.length > 0) {
            const resolve = this.waiting.shift()
            if (resolve) {
                if (value === undefined) {
                    resolve(value as T)
                } else {
                    resolve(await value)
                }
            }
        }
        return { value: value as T, done: true }
    }

    private controller: AbortToken = new AbortToken()

    start() {
        this.state = 'open'

        this.controller
            .wrap(
                new Promise<void>(async () => {
                    for await (const item of this) {
                        if (this.state === 'closed') return
                        await this.processor(item)
                    }
                })
            )
            .catch(() => {
                this.state = 'closed'
                // process.exit();
            })
    }

    stop() {
        this.state = 'closed'
        this.controller.abort()
    }
}

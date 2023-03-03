[![Node.js Package](https://github.com/gustawdaniel/async-queue/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/gustawdaniel/async-queue/actions/workflows/npm-publish.yml)

# Async Queue

Super simple below 100 lines queue implementation build with `Promise.race` and `AsyncIterator`.

Features:
- you can quite it by `stop` loosing all unprocessed items that it useful in tests
- you do not have to connect with redis or open any port, everything works in memory
- define simple processing function and forget about it, now you can simply `push` items to process

## Installation

```
npm i @gustawdaniel/queue-async
```

## Usage

```typescript
import {AsyncQueue, Queue} from '@gustawdaniel/queue-async';

let sum = 0
const queue: Queue<number> = new AsyncQueue<number>(async (item) => {
    sum += item
})
for (const i of new Array(6).fill(1)) {
    queue.push(i)
}
queue.start()
await sleep(1)
expect(sum).toEqual(6)
```

## Interface

```typescript
export interface Queue<T> {
    state: 'open' | 'closed'

    push(item: T): void

    pull(): Promise<T>

    start(): void

    stop(): void

    [Symbol.asyncIterator](): AsyncIterator<T>
}
```

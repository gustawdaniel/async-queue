import { AsyncQueue, Queue, sleep } from '../src/AsyncQueue'

describe('queue', () => {
    it('correctly process items', async () => {
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
    })

    it('can be stopped', async () => {
        let sum = 0
        const queue: Queue<number> = new AsyncQueue<number>(async (item) => {
            sum += item
        })
        queue.start()
        let index = 0
        for (const i of new Array(1000).fill(1)) {
            queue.push(i)
            if (index++ > 500) {
                await sleep(1)
                queue.stop()
            }
        }
        expect(sum).toBeGreaterThan(500)
        expect(sum).toBeLessThan(1000)
    })
})

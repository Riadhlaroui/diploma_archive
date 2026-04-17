// utils/rateLimiter.ts

export class RateLimiter {
	private queue: (() => void)[] = [];
	private running = false;

	constructor(
		private readonly minGapMs: number, // minimum ms between calls
	) {}

	acquire(): Promise<void> {
		return new Promise((resolve) => {
			this.queue.push(resolve);
			if (!this.running) this.drain();
		});
	}

	private async drain() {
		this.running = true;
		while (this.queue.length > 0) {
			const next = this.queue.shift()!;
			next();
			if (this.queue.length > 0) {
				await new Promise((r) => setTimeout(r, this.minGapMs));
			}
		}
		this.running = false;
	}
}

export const ocrRateLimiter = new RateLimiter(4_000);

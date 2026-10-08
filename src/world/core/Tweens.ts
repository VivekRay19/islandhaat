import { Ease, easeOutCubic } from './math';

export interface TweenOptions {
  duration: number;
  delay?: number;
  ease?: Ease;
  update: (k: number) => void;
  complete?: () => void;
}

interface Tween extends TweenOptions {
  t: number;
  cancelled: boolean;
}

/** Minimal tween runner. Every interaction in the world is eased through this. */
export class Tweens {
  private list: Tween[] = [];

  add(opts: TweenOptions): { cancel: () => void } {
    const tw: Tween = { ...opts, t: -(opts.delay ?? 0), cancelled: false };
    this.list.push(tw);
    return { cancel: () => (tw.cancelled = true) };
  }

  promise(opts: TweenOptions): Promise<void> {
    return new Promise((resolve) => {
      const done = opts.complete;
      this.add({
        ...opts,
        complete: () => {
          done?.();
          resolve();
        }
      });
    });
  }

  wait(seconds: number): Promise<void> {
    return this.promise({ duration: seconds, update: () => {} });
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const tw = this.list[i];
      if (tw.cancelled) {
        this.list.splice(i, 1);
        continue;
      }
      tw.t += dt;
      if (tw.t < 0) continue;
      const raw = Math.min(1, tw.t / Math.max(0.0001, tw.duration));
      tw.update((tw.ease ?? easeOutCubic)(raw));
      if (raw >= 1) {
        this.list.splice(i, 1);
        tw.complete?.();
      }
    }
  }
}

import { Component, inject, signal, OnInit, OnDestroy, NgZone } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MarketData } from '../../services/market-data';

@Component({
  selector: 'app-stats-bar',
  imports: [DecimalPipe],
  templateUrl: './stats-bar.html',
  styleUrl: './stats-bar.css',
})
export class StatsBar implements OnInit, OnDestroy {
  market = inject(MarketData);
  private zone = inject(NgZone);

  fps = signal(0);
  memory = signal(0);
  private frameId: number = 0;

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      let last = performance.now();
      let frames = 0;
      const loop = () => {
        frames++;
        const now = performance.now();
        if (now - last >= 1000) {
          this.zone.run(() => this.fps.set(frames));
          this.zone.run(() => this.memory.set((performance as any).memory?.usedJSHeapSize / 1048576 || 0));
          frames = 0;
          last = now;
        }
        this.frameId = requestAnimationFrame(loop);
      };
      loop();
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.frameId);
  }
}

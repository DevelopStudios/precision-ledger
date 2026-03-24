import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { bufferTime, map, retry, catchError, switchMap, share } from 'rxjs/operators';

export interface Ticker {
  s: string;
  c: string;
  p: string;
  up: boolean;
}

@Injectable({ providedIn: 'root' })
export class MarketData {
  private dataMap = signal<Map<string, Ticker>>(new Map());
  public tickers = computed(() => Array.from(this.dataMap().values()));

  public throttleMs = signal(250);
  private throttle$ = new BehaviorSubject(250);

  public eventsPerSecond = signal(0);

  updateThrottle(ms: number) {
    this.throttleMs.set(ms);
    this.throttle$.next(ms);
  }

  constructor() {
    const globalUrl = 'wss://stream.binance.com:443/stream?streams=!miniTicker@arr/!bookTicker';
    const usUrl = 'wss://stream.binance.us:9443/stream?streams=!miniTicker@arr/!bookTicker';

    const stream$ = webSocket<any>(globalUrl).pipe(
      catchError(() => webSocket<any>(usUrl)),
      retry({ delay: 2000 }),
      map((msg: any) => msg.data || []),
      share()
    );

    this.throttle$.pipe(
      switchMap(ms => stream$.pipe(bufferTime(ms), map(batches => batches.flat())))
    ).subscribe(updates => {
      this.eventsPerSecond.set(Math.floor(updates.length * (1000 / this.throttleMs())));
      if (!updates.length) return;
      this.dataMap.update(currentMap => {
        const nextMap = new Map(currentMap);
        updates.forEach((u: any) => {
          const prev = nextMap.get(u.s);
          
          let price = u.c;
          let percent = '0.00';
          if (u.o) {
             price = u.c;
             percent = ((parseFloat(u.c) - parseFloat(u.o)) / parseFloat(u.o) * 100).toFixed(2);
          } 
          else if (u.a) {
             price = u.a;
             percent = prev?.p || '0.00';
          }

          if (!price) return;

          nextMap.set(u.s, {
            s: u.s,
            c: price,
            p: percent,
            up: prev ? parseFloat(price) > parseFloat(prev.c) : true
          });
        });
        return nextMap;
      });
    });
  }
}
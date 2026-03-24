import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import { MarketData } from '../../services/market-data';


@Component({
  selector: 'app-market-grid',
  standalone: true,
  imports: [ScrollingModule, NgClass],
  templateUrl: './market-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketGrid {
  market = inject(MarketData);

  trackTicker(index: number, item: any) {
    return item.s;
  }

  getLogo(symbol: string) {
    const base = symbol.replace(/USDT$|BUSD$|USDC$/, '').toLowerCase();
    return `https://assets.coincap.io/assets/icons/${base}@2x.png`;
  }

  handleImageError(event: Event, symbol: string) {
    const img = event.target as HTMLImageElement;
    img.src = `https://ui-avatars.com/api/?name=${symbol}&background=334155&color=fff&rounded=true&font-size=0.33&length=3`;
  }
}
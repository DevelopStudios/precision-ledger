import { Component, inject } from '@angular/core';
import { MarketData } from '../../services/market-data';

@Component({
  selector: 'app-market-controls',
  imports: [],
  templateUrl: './market-controls.html',
  styleUrl: './market-controls.css',
})
export class MarketControls {
  market = inject(MarketData);

  updateThrottle(event: Event) {
    this.market.updateThrottle(Number((event.target as HTMLInputElement).value));
  }
}

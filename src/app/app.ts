import { Component, signal } from '@angular/core';
import { MarketGrid } from "./components/market-grid/market-grid";
import { StatsBar } from "./components/stats-bar/stats-bar";
import { MarketControls } from "./components/market-controls/market-controls";

@Component({
  selector: 'app-root',
  imports: [MarketGrid, StatsBar, MarketControls],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('precision-ledger');
}

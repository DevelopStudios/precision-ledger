import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, viewChild, OnInit, effect } from '@angular/core';
import { AnalystService } from '../../services/analyst-service';
import { MarketData } from '../../services/market-data';

@Component({
  selector: 'app-alpha-analyst',
  imports: [CommonModule],
  templateUrl: './alpha-analyst.html',
  styleUrl: './alpha-analyst.css',
})
export class AlphaAnalyst implements OnInit {
  public analyst = inject(AnalystService);
  private market = inject(MarketData);

  private queryInput = viewChild<ElementRef<HTMLInputElement>>('queryInput');
  private scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  constructor() {
    effect(() => {
      this.analyst.chatHistory();
      this.scrollToBottom();
    });
  }

  ngOnInit() {
    this.analyst.initEngin();
  }

  async sendQuery() {
    const el = this.queryInput()?.nativeElement;
    if (!el || !el.value.trim()) return;
    const prompt = el.value;
    el.value = '';
    await this.analyst.askAnalyst(prompt);
  }

  private scrollToBottom() {
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      // Threshold to determine if the user is "at the bottom" (150px safety margin)
      const threshold = 150;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

      // Only auto-scroll if the user was already near the bottom.
      // This prevents the UI from jumping while the user is trying to read.
      if (isNearBottom) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 0);
      }
    }
  }

  formatDataPoints(content: string) {
    return content.replace(/(\$?\d+\.?\d*%?)/g, '<span class="font-mono text-primary">$1</span>');
  }
}

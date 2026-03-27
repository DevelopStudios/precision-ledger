import { inject, Injectable, signal, effect } from '@angular/core';
import * as webllm from '@mlc-ai/web-llm';
import { CreateWebWorkerMLCEngine } from '@mlc-ai/web-llm';
import { MarketData } from './market-data';

export interface ChatMessage {
  role: string;
  content: string;
  type?: 'standard' | 'asset-change' | 'volatility-alert' | 'insight';
}

@Injectable({
  providedIn: 'root',
})
export class AnalystService {
  private engin?: webllm.MLCEngineInterface;
  private market = inject(MarketData);
  public isModelLoading = signal(false);
  public loadProgress = signal(0); //0 to 100
  public isReady = signal(false);
  public isGenerating = signal(false);
  public chatHistory = signal<ChatMessage[]>([]);

  private readonly modelId = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
  private lastAlertedSymbols = new Map<string, number>();
  private lastUserInteractionTime = 0;
  private readonly AUTO_PAUSE_MS = 5000; // Reduced to 5 seconds for better responsiveness

  constructor() {
    // Automated Market Watcher
    effect(() => {
      if (!this.isReady() || this.isGenerating()) return;

      // Wait logic: only run if the user has been inactive
      if (Date.now() - this.lastUserInteractionTime < this.AUTO_PAUSE_MS) return;

      const tickers = this.market.tickers();
      // Find high-movement assets (> 2% change)
      const significantMove = tickers.find(t => {
        const percent = Math.abs(parseFloat(t.p));
        const now = Date.now();
        const lastAlert = this.lastAlertedSymbols.get(t.s) || 0;
        
        // Alert if > 2% and we haven't messaged about this symbol in the last 30 seconds
        return percent > 2.0 && (now - lastAlert > 30000);
      });

      if (significantMove) {
        this.triggerAutomatedAnalysis(significantMove);
      }
    });
  }

  private async triggerAutomatedAnalysis(ticker: any) {
    this.lastAlertedSymbols.set(ticker.s, Date.now());
    const percent = parseFloat(ticker.p);

    // 1. Add Asset Change Message (Green)
    this.chatHistory.update(h => [...h, { 
      role: 'assistant', 
      content: `MOVEMENT DETECTED: ${ticker.s} is currently trading at $${ticker.c}.`, 
      type: 'asset-change' 
    }]);

    // 2. Add Volatility Alert if applicable (Red)
    if (Math.abs(percent) > 5.0) {
      this.chatHistory.update(h => [...h, { 
        role: 'assistant', 
        content: `VOLATILITY CRITICAL: High-frequency shift detected with a ${ticker.p}% swing.`, 
        type: 'volatility-alert' 
      }]);
    }

    // 3. Generate Insight (Blue)
    await this.generateAutoInsight(ticker);
  }

  private async generateAutoInsight(ticker: any) {
    try {
      this.isGenerating.set(true);
      
      // Add Insight Placeholder
      this.chatHistory.update(h => [...h, { role: 'assistant', content: 'Synthesizing market insight...', type: 'insight' }]);

      const messages = [
        { role: 'system', content: 'You are the Alpha Analyst. Provide a very short, 1-sentence technical insight for the provided asset movement.' },
        { role: 'user', content: `Analyze ${ticker.s} at ${ticker.c} (${ticker.p}%)` }
      ];

      const chunks = await this.engin?.chat.completions.create({ messages: messages as any, stream: true });
      if (!chunks) return;

      let fullResponse = "";
      for await (const chunk of chunks) {
        fullResponse += chunk.choices[0]?.delta?.content || "";
        this.chatHistory.update(history => {
          const newHistory = [...history];
          newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], content: fullResponse };
          return newHistory;
        });
      }
    } catch (err) {
      console.error("Auto-Insight Error:", err);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Records user activity to pause automated analysis
   */
  public recordUserActivity() {
    this.lastUserInteractionTime = Date.now();
  }

  async initEngin() {
    try {
      this.isModelLoading.set(true);
      this.engin = await CreateWebWorkerMLCEngine(
        new Worker(new URL('./analyst.worker.ts', import.meta.url), { type: 'module' }),
        this.modelId,
        { initProgressCallback: (r) => this.loadProgress.set(Math.round(r.progress * 100)) }
      );
      this.isReady.set(true);
    } catch (err) {
      console.error("Failed to initialize AI engine:", err);
    } finally {
      this.isModelLoading.set(false);
    }
  }

async askAnalyst(userQuery: string) {
  this.recordUserActivity();

  if (!this.engin || this.isGenerating()) return;

    try {
    this.isGenerating.set(true);
    
    // 1. Add user message to history
    this.chatHistory.update(h => [...h, { role: "user", content: userQuery, type: 'standard' }]);

  // 2. Get the latest market snapshot
 const topAssets = this.market.tickers()
      .slice(0, 10) 
      .map(t => `${t.s}: $${t.c} (${t.p}%)`)
      .join(", ");


    const systemPrompt = {
      role: "system",
      content: `You are the Alpha Analyst for the Precision Ledger. 
                Current Market State: ${topAssets}. 
                Analyze the data specifically for liquidity shifts and volatility.`
    };

    // History already includes the userQuery from step 1
    const messages = [systemPrompt, ...this.chatHistory()];
    
    // 3. Create a placeholder for the assistant response
    this.chatHistory.update(h => [...h, { role: "assistant", content: "", type: 'standard' }]);

  const chunks = await this.engin.chat.completions.create({
    messages: messages as any,
    stream: true, // Enabling streaming for better UX
  });

  let fullResponse = "";
  let lastUpdate = 0;

  for await (const chunk of chunks) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullResponse += content;
    
    // Only update the UI every 60ms (~16fps) to prevent the main thread from locking up
    const now = performance.now();
    if (now - lastUpdate > 60) {
      this.chatHistory.update(history => {
        const newHistory = [...history];
        newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], content: fullResponse };
        return newHistory;
      });
      lastUpdate = now;
    }
  }

  // Final update to ensure the message is fully completed in the UI
  this.chatHistory.update(history => {
    const newHistory = [...history];
    newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], content: fullResponse };
    return newHistory;
  });

  } catch (err) {
    console.error("Alpha Analyst Error:", err);
    this.chatHistory.update(history => {
      const newHistory = [...history];
      if (newHistory.length > 0) {
        newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], content: "Error: Analysis stream interrupted." };
      }
      return newHistory;
    });
  } finally {
    this.isGenerating.set(false);
  }
}
}
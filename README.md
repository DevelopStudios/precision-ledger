# Precision Ledger

A real-time crypto market dashboard with an in-browser AI analyst — live Binance data, no backend, no API keys.

**Live:** [precisionledger-j423d.kinsta.page](https://precisionledger-j423d.kinsta.page)

---

## What makes it interesting

Two things running in parallel: a live WebSocket stream from Binance pushing hundreds of ticker updates per second, and a local LLM watching the market and generating insights automatically.

When any asset moves more than 2%, the Alpha Analyst triggers — it streams a one-sentence technical analysis directly into the chat panel without user input. You can also query it manually; it receives a live market snapshot as context before generating a response. Everything runs in the browser, nothing leaves the device.

---

## How it works

| Layer | Technology | Role |
|-------|-----------|------|
| Market data | Binance WebSocket (`wss://stream.binance.com`) | Live ticker stream with US endpoint fallback |
| Batching | RxJS `bufferTime` + `switchMap` | Throttles high-frequency updates — configurable ms |
| State | Angular Signals + `computed` | Reactive ticker map, events-per-second counter |
| AI analyst | Llama-3.2-1B-Instruct via WebLLM | Auto-triggers on >2% moves, streams responses |
| Inference | Web Worker | Non-blocking — UI stays responsive during generation |
| Framework | Angular 17+ | Signals, OnPush, standalone components |

The stream can push 500+ events/second. `bufferTime` batches them into a single map update per interval, keeping change detection flat regardless of market volatility.

---

## Stack

- Angular 17
- RxJS (`webSocket`, `bufferTime`, `retry`)
- `@mlc-ai/web-llm` — WebGPU inference in-browser
- Binance WebSocket API (public, no auth required)
- TypeScript

---

## Run locally

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200`

---

## WebGPU compatibility

The AI analyst requires WebGPU. Supported on Chrome 113+ and Edge 113+ (desktop). The live market feed works on all browsers.

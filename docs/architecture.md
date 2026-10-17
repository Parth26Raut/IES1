# RISKWISE — Architecture Document

## System Overview

RISKWISE is a client-server web application with a React frontend and Python FastAPI backend. All financial calculations are performed server-side for consistency and testability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Landing  │ │Dashboard │ │Trade Lab │ │ Wealth Trap  │   │
│  │  Page    │ │  Page    │ │  Page    │ │ Observatory  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │Behaviour │ │ Learn    │ │Research  │ │ Methodology  │   │
│  │  Check   │ │  Risk    │ │   Lab    │ │  & Sources   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                       │                                      │
│                 API Service Layer                             │
│               (fetch → /api/v1/...)                          │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTP (JSON)
                         │ Proxy: localhost:5173 → localhost:8000
                         │
┌────────────────────────┼────────────────────────────────────┐
│                    Backend (FastAPI)                          │
│                         │                                    │
│  ┌─────────────────────┼───────────────────────────────┐    │
│  │              API Router Layer                        │    │
│  │  /trades  /risk  /behavioural  /education  /research │    │
│  └─────────────────────┼───────────────────────────────┘    │
│                         │                                    │
│  ┌─────────────────────┼───────────────────────────────┐    │
│  │              Service Layer                           │    │
│  │  ┌──────────────┐ ┌────────────┐ ┌──────────────┐   │    │
│  │  │   Payoff     │ │   Black-   │ │    Risk      │   │    │
│  │  │ Calculator   │ │  Scholes   │ │   Engine     │   │    │
│  │  └──────────────┘ └────────────┘ └──────────────┘   │    │
│  │  ┌──────────────┐ ┌────────────┐ ┌──────────────┐   │    │
│  │  │ Behavioural  │ │ Education  │ │  Research    │   │    │
│  │  │  Analysis    │ │  Service   │ │  Analysis    │   │    │
│  │  └──────────────┘ └────────────┘ └──────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────┼──────────────────────────────┐    │
│  │              Data Layer                              │    │
│  │        SQLite (riskwise.db)                         │    │
│  │  Tables: trade_analyses, quiz_scores,               │    │
│  │          research_participants, research_assessments,│    │
│  │          behavioural_reflections                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Deterministic calculations first.** All financial math uses verified formulas — never AI-generated numbers.
2. **Separation of concerns.** Calculation engine, risk rules, API, and UI are independent layers.
3. **Transparency.** Every risk score has a published formula. Every warning cites its rule.
4. **Testability.** Financial calculations have comprehensive unit tests with known fixtures.
5. **Offline-first.** The entire application runs locally without external API dependencies.

## Data Flow

### Trade Analysis Flow
1. User enters hypothetical trade parameters in the Trade Lab form.
2. Frontend validates inputs and sends POST to `/api/v1/trades/analyse`.
3. Backend validates with Pydantic schemas.
4. Payoff Calculator computes: gross/net P&L, max loss, max gain, break-even, scenarios.
5. Black-Scholes service computes: theoretical price, Greeks.
6. Risk Engine evaluates 10 rule categories against calculated metrics.
7. Structured response returned with trade summary, metrics, findings, explanations.
8. Frontend renders results: payoff chart, scenario table, risk findings, explanations.
9. Analysis saved to SQLite for dashboard history.

### Risk Scoring Flow
1. Each rule evaluates independently, producing a severity and a weighted contribution.
2. Weights are published: max_loss (15%), capital_risk (15%), loss_limit (15%), asymmetry (10%), expiry (10%), volatility (5%), tail_risk (15%), cost (5%), missing_info (5%), behavioural (5%).
3. Final score = weighted sum of individual rule scores (0-100 scale).
4. Classification: Lower (0-25), Moderate (26-50), Elevated (51-75), Severe (76-100).

## Security Considerations

- No real-money trading or brokerage integration.
- No collection of brokerage credentials.
- No PII collection by default (research module collects only anonymized IDs).
- CORS restricted to configured frontend origin.
- Input validation on all endpoints.
- No API keys committed to repository.

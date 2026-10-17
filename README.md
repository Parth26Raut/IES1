# RISKWISE
## An AI-Assisted Pre-Trade Risk Intelligence Platform

**Before You Trade. Understand What You Risk.**

RISKWISE is an educational and research-oriented pre-trade risk intelligence platform designed for Gen Z options traders in India. It converts complex options metrics into understandable financial consequences, evaluates hypothetical trades, and provides transparent risk explanations.

> **Disclaimer:** RISKWISE is an educational and research prototype. It does not execute trades, provide personalised investment advice, or guarantee outcomes. Calculations depend on user-supplied inputs and stated assumptions. Options can result in substantial financial losses. Verify contract specifications, charges, and market data independently.

---

## Features

### Module A — Landing Page
Premium fintech landing page with product introduction, feature highlights, and quick-start CTAs.

### Module B — Risk Intelligence Dashboard
Personalized dashboard with KPI cards, risk classification charts, outcome distributions, and analysis history.

### Module C — Interactive Options Trade Lab
Construct and analyse hypothetical options positions:
- Long Call, Long Put, Short Call, Short Put
- Full payoff calculation with break-even, max loss, max gain
- Scenario analysis at different price levels
- Interactive payoff chart
- Black-Scholes pricing with Greeks (Delta, Gamma, Theta, Vega)
- Risk findings with plain-language explanations

### Module D — Pre-Trade Risk Intelligence Engine
Rules-based risk analysis covering:
- Maximum-loss exposure and capital-at-risk ratios
- Short-option tail risk warnings
- Cost sensitivity analysis
- Behavioural pressure indicators
- Transparent risk scoring with published formula

### Module E — Behavioural Decision Check
Optional self-assessment exploring FOMO, social-media influence, loss-chasing, and trading motivations.

### Module F — The Gen Z Wealth Trap Observatory
Educational research dashboard on wealth aspirations, digital influence, and speculative trading.

### Module G — Risk Literacy Challenge
Pre/post educational quiz covering option fundamentals with score tracking and improvement measurement.

### Module H — Research & Experiment Lab
Configure educational experiments with control/intervention groups, track outcomes, and export anonymized data.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router |
| Backend | Python, FastAPI, Pydantic |
| Calculations | NumPy, SciPy |
| Database | SQLite (via aiosqlite) |
| Testing | pytest, httpx |

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ and pip

### Installation

```bash
# Clone or navigate to the project directory
cd riskwise

# Backend setup
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 — Backend:**
```bash
cd riskwise/backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd riskwise/frontend
npm run dev
```

### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/v1/health

---

## Running Tests

```bash
cd riskwise/backend
venv\Scripts\activate
pytest tests/ -v
```

---

## Project Structure

```
riskwise/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Formatting, presets, localStorage
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI route handlers
│   │   ├── schemas/         # Pydantic models
│   │   ├── services/        # Business logic
│   │   │   ├── payoff_calculator.py
│   │   │   ├── black_scholes.py
│   │   │   ├── risk_engine.py
│   │   │   ├── behavioural_analysis.py
│   │   │   ├── research_analysis.py
│   │   │   └── education_service.py
│   │   ├── models/          # Database models
│   │   ├── repositories/    # Data access layer
│   │   └── core/            # Configuration, database
│   ├── tests/               # pytest unit & integration tests
│   └── requirements.txt
├── data/
│   ├── demo/                # Synthetic demonstration data
│   └── references/          # Research references
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   ├── research_protocol.md
│   ├── limitations.md
│   └── api.md
├── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/trades/analyse` | Full trade analysis |
| POST | `/api/v1/trades/scenarios` | Scenario analysis |
| POST | `/api/v1/trades/price` | Black-Scholes pricing |
| POST | `/api/v1/risk/evaluate` | Risk evaluation |
| POST | `/api/v1/behavioural/reflect` | Behavioural assessment |
| GET | `/api/v1/education/questions` | Get quiz questions |
| POST | `/api/v1/education/submit` | Submit quiz answers |
| GET | `/api/v1/research/summary` | Research experiment summary |
| POST | `/api/v1/research/participants` | Add research participant |
| POST | `/api/v1/research/assessments` | Submit assessment |
| GET | `/api/v1/research/export` | Export research data (CSV) |
| POST | `/api/v1/research/seed-demo` | Seed synthetic demo data |
| GET | `/api/v1/health` | Health check |

---

## Financial Conventions

- **Currency:** Indian Rupees (INR, ₹)
- **Number Formatting:** Indian comma notation (e.g., ₹1,23,456.78)
- **Time Zone:** IST (UTC+5:30)
- **Market Examples:** NIFTY, BANKNIFTY (NSE-style)
- **Option Style:** European-style vanilla options
- **Pricing Model:** Black-Scholes (educational estimate only)

---

## Known Limitations

1. **No live market data.** All prices are user-supplied hypothetical values.
2. **European options only.** American-style early exercise is not modelled.
3. **Single-leg positions only.** Multi-leg strategies (spreads, straddles) are not supported in the MVP.
4. **Simplified cost model.** STT, stamp duty, GST, and exchange charges are approximated via a single "transaction charges" field.
5. **Black-Scholes limitations.** The model assumes constant volatility, no dividends, and log-normal returns.
6. **No margin calculator.** Short option margin requirements are broker-specific and not modelled.
7. **Quiz not validated.** The risk literacy quiz has not undergone psychometric validation.
8. **Research module is a prototype.** Not suitable for IRB-reviewed research without additional ethics review.

---

## License

This project is an educational prototype developed for academic and research purposes.

---

## Acknowledgements

- SEBI for publicly available F&O market studies
- NSE for options contract specification references
- The behavioural finance research community

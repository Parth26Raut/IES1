# RISKWISE — API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Interactive Documentation

FastAPI auto-generates interactive API docs:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Endpoints

### Health Check

#### `GET /health`

Returns application health status.

**Response:**
```json
{
  "status": "healthy",
  "app_name": "RISKWISE",
  "version": "1.0.0",
  "database": "connected"
}
```

---

### Trade Analysis

#### `POST /trades/analyse`

Performs a complete trade analysis including payoff calculation, risk evaluation, and educational explanation.

**Request Body:**
```json
{
  "underlying": "NIFTY",
  "position_type": "long_call",
  "spot_price": 22500,
  "strike_price": 22600,
  "premium": 150,
  "lot_size": 50,
  "num_lots": 1,
  "expiry_days": 7,
  "implied_volatility": 15,
  "risk_free_rate": 6.5,
  "brokerage": 20,
  "transaction_charges": 50,
  "slippage": 25,
  "available_capital": 100000,
  "max_acceptable_loss": 10000
}
```

**Response:** Full analysis response including trade_summary, payoff_metrics, risk_findings, scenario_results, etc.

#### `POST /trades/scenarios`

Runs scenario analysis for a trade at different underlying prices.

**Request Body:** Same as `/trades/analyse`, plus optional `scenarios` array.

#### `POST /trades/price`

Calculates Black-Scholes theoretical price and Greeks.

**Request Body:**
```json
{
  "spot_price": 22500,
  "strike_price": 22600,
  "time_to_expiry": 0.0192,
  "risk_free_rate": 0.065,
  "implied_volatility": 0.15,
  "option_type": "call"
}
```

**Response:**
```json
{
  "theoretical_price": 127.43,
  "delta": 0.421,
  "gamma": 0.00089,
  "theta": -12.34,
  "vega": 8.56,
  "option_type": "call",
  "model_note": "Black-Scholes estimate for European-style option. May differ from exchange prices."
}
```

---

### Risk Evaluation

#### `POST /risk/evaluate`

Evaluates risk dimensions for a trade.

**Request Body:** Same as `/trades/analyse`, plus optional behavioural inputs.

**Response:** Structured risk findings with severity, explanations, and educational tips.

---

### Behavioural Assessment

#### `POST /behavioural/reflect`

Processes a behavioural self-assessment.

**Request Body:**
```json
{
  "main_reason": "fomo",
  "social_media_source": true,
  "understands_max_loss": false,
  "acting_on_fomo": true,
  "recovering_losses": false,
  "influenced_by_screenshot": true,
  "loss_affects_essentials": null,
  "independent_evaluation": false
}
```

**Response:**
```json
{
  "flags": ["fomo_detected", "social_media_influence", "max_loss_unknown", "screenshot_influence", "no_independent_evaluation"],
  "reflection_text": "Your responses suggest that urgency and social-media exposure may be influencing this decision...",
  "concern_level": "elevated"
}
```

---

### Education

#### `GET /education/questions?count=10&exclude=q1,q2`

Returns quiz questions. Use `exclude` to avoid repeating questions in a post-test.

#### `POST /education/submit`

Submits quiz answers and returns scored results.

**Request Body:**
```json
{
  "answers": {
    "q1": "b",
    "q3": "a",
    "q7": "c"
  },
  "session_type": "pre_test"
}
```

---

### Research

#### `GET /research/summary`

Returns experiment summary statistics.

#### `POST /research/participants`

Creates a new research participant.

#### `POST /research/assessments`

Submits a participant assessment.

#### `GET /research/export`

Exports research data as CSV file.

#### `POST /research/seed-demo`

Seeds synthetic demonstration data for the research module.

---

## Error Handling

All errors return structured JSON:

```json
{
  "detail": "Descriptive error message",
  "field": "optional_field_name",
  "code": "VALIDATION_ERROR"
}
```

**HTTP Status Codes:**
- `200` — Success
- `201` — Created
- `400` — Validation error
- `404` — Not found
- `422` — Unprocessable entity (Pydantic validation failure)
- `500` — Internal server error

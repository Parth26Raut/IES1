# RISKWISE — Methodology

## 1. Payoff Calculations

All payoff calculations model **European-style vanilla options held until expiry**.

### Notation

| Symbol | Meaning |
|--------|---------|
| S | Underlying price at expiry |
| K | Strike price |
| p | Premium per unit (per share/per lot unit) |
| q | Total quantity = lot_size × num_lots |
| C | Total explicitly modelled costs (brokerage + transaction charges + slippage) |

### Gross Payoff at Expiry

| Position | Gross P&L |
|----------|-----------|
| Long Call | max(S − K, 0) × q − p × q |
| Long Put | max(K − S, 0) × q − p × q |
| Short Call | p × q − max(S − K, 0) × q |
| Short Put | p × q − max(K − S, 0) × q |

### Net P&L

Net P&L = Gross P&L − C

### Break-Even at Expiry

| Position | Break-Even Price |
|----------|-----------------|
| Long Call | K + p |
| Long Put | K − p |
| Short Call | K + p |
| Short Put | K − p |

### Maximum Loss

| Position | Maximum Loss |
|----------|-------------|
| Long Call | p × q + C (premium paid + costs) |
| Long Put | p × q + C (premium paid + costs) |
| Short Call | **Unlimited** (no upper bound on underlying price) |
| Short Put | (K − p) × q + C (under zero lower bound for underlying) |

### Maximum Gain

| Position | Maximum Gain |
|----------|-------------|
| Long Call | **Unlimited** |
| Long Put | (K − p) × q − C (underlying falls to zero) |
| Short Call | p × q − C (premium received minus costs) |
| Short Put | p × q − C (premium received minus costs) |

### Important Notes

- For short calls, **maximum loss is theoretically unlimited**. RISKWISE never represents this as a finite number.
- For short options, maximum possible loss, required margin, and available collateral are distinct concepts. RISKWISE does not calculate broker-specific margin requirements.
- Transaction costs are separated into brokerage, transaction charges, and slippage. STT, stamp duty, GST, and exchange charges are approximated via the transaction charges field. Users should verify actual charges.

---

## 2. Black-Scholes Model

RISKWISE implements the standard Black-Scholes-Merton model for **European-style options on non-dividend-paying underlyings**.

### Formulas

**d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)**

**d₂ = d₁ − σ√T**

**Call price = S·N(d₁) − K·e^(−rT)·N(d₂)**

**Put price = K·e^(−rT)·N(−d₂) − S·N(−d₁)**

Where:
- S = current spot price
- K = strike price
- T = time to expiry in years
- r = continuously compounded risk-free rate
- σ = annualized implied volatility
- N(·) = standard normal cumulative distribution function

### Greeks

| Greek | Definition | Units |
|-------|-----------|-------|
| Delta (Δ) | ∂V/∂S | Per ₹1 change in underlying. Call: [0, 1], Put: [−1, 0] |
| Gamma (Γ) | ∂²V/∂S² | Per ₹1 change in underlying (rate of change of Delta) |
| Theta (Θ) | ∂V/∂t | Per calendar day (shown as negative for time decay on long positions) |
| Vega (ν) | ∂V/∂σ | Per 1 percentage point change in implied volatility |

### Model Assumptions

1. The underlying follows geometric Brownian motion with constant volatility.
2. No dividends during the option's life.
3. Continuously compounded risk-free rate is constant.
4. No transaction costs in the model itself.
5. European exercise only (no early exercise).
6. Markets are frictionless and continuous.
7. Returns are log-normally distributed.

### Model Limitations

- Real-world volatility is not constant (volatility smile/skew).
- NIFTY and BANKNIFTY options pay no dividends on the index itself, but constituent dividends affect the index level.
- The model does not capture jump risk or extreme tail events.
- Implied volatility from the model may differ from exchange-quoted IV.
- The model provides a **theoretical educational estimate**, not a tradeable price.

### Verification

The implementation verifies:
- **Put-call parity:** C − P = S − K·e^(−rT)
- **No-arbitrage bounds:** C ≥ max(S − K·e^(−rT), 0), P ≥ max(K·e^(−rT) − S, 0)
- **Edge cases:** T = 0 returns intrinsic value; σ = 0 returns discounted intrinsic value.

---

## 3. Risk Engine Methodology

### Rule Categories

The risk engine evaluates 10 independent dimensions:

1. **Maximum-loss exposure** — Absolute size of potential loss.
2. **Capital-at-risk ratio** — Max loss as percentage of declared capital.
3. **Loss-limit breach** — Max loss vs user's stated tolerance.
4. **Risk asymmetry** — Ratio of potential loss to potential gain.
5. **Expiry risk** — Proximity to expiry (accelerated time decay).
6. **Implied-volatility sensitivity** — High IV environment.
7. **Short-option tail risk** — Unlimited loss potential.
8. **Cost sensitivity** — Transaction costs relative to premium.
9. **Missing information** — Inputs that could materially change results.
10. **Behavioural pressure** — FOMO, loss-chasing, social-media influence.

### Risk Score Calculation

Each rule produces a score from 0 to 100 for its dimension. The aggregate risk score is a weighted sum:

| Dimension | Weight |
|-----------|--------|
| Max-loss exposure | 15% |
| Capital-at-risk | 15% |
| Loss-limit breach | 15% |
| Risk asymmetry | 10% |
| Expiry risk | 10% |
| IV sensitivity | 5% |
| Short tail risk | 15% |
| Cost sensitivity | 5% |
| Missing info | 5% |
| Behavioural pressure | 5% |

**Total = Σ(weight_i × score_i)**

### Risk Classification

| Score Range | Classification | Meaning |
|-------------|---------------|---------|
| 0–25 | Lower relative exposure | Risk metrics are within moderate bounds |
| 26–50 | Moderate relative exposure | Some risk factors require attention |
| 51–75 | Elevated exposure | Multiple risk factors are concerning |
| 76–100 | Severe exposure | Significant risk factors present |

### Important Caveats

- A "lower" classification does not mean the trade is safe or recommended.
- The risk score is a structured summary, not a prediction of loss probability.
- Behavioural signals are self-reported and processed as prompts for reflection, not diagnoses.
- The weights are designed for educational illustration and have not been empirically validated.

---

## 4. Behavioural Assessment Methodology

The behavioural self-assessment is an optional, voluntary questionnaire. It is **not** a validated psychometric instrument.

- Responses are processed using simple rule-based logic.
- Flags are generated when responses indicate potential pressure factors.
- The reflection summary is constructed from templates, not from clinical evaluation.
- RISKWISE never diagnoses gambling addiction, mental health conditions, or financial incompetence.
- Users can skip any question ("Prefer not to answer").

---

## 5. Risk Literacy Quiz Methodology

- Questions are drawn from a bank covering 10 option-trading concepts.
- Pre-test and post-test use non-overlapping questions where possible.
- Scores are calculated as (correct answers / total questions) × 100.
- Per-concept performance tracks accuracy within each concept tag.
- Score improvement is reported as the difference in percentage points.
- **Immediate score improvement does not establish lasting learning or behavioural change.**
- The quiz has not undergone psychometric validation (item difficulty analysis, reliability testing).

---

## 6. Research Experiment Design

The research module supports a basic pre-post experimental design:

- **Independent variable:** Exposure to RISKWISE pre-trade risk analysis (intervention) vs standard trade description (control).
- **Primary dependent variable:** Post-intervention risk comprehension score (with baseline recorded).
- **Assignment:** Random assignment to control or intervention group.
- **No deception or real financial risk is involved.**

### Limitations

- The platform provides the infrastructure for an experiment, not a completed study.
- No IRB/ethics approval has been obtained.
- Sample sizes in a prototype demo are too small for statistical inference.
- The synthetic demo dataset is clearly labelled and not real participant data.

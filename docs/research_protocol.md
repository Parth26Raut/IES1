# RISKWISE — Research Protocol

## Study Title

Effect of Pre-Trade Risk Intelligence on Options Risk Comprehension Among Young Adult Traders: A Prototype Experimental Design

## Study Purpose

To investigate whether exposure to structured pre-trade risk analysis (using the RISKWISE platform) improves risk comprehension compared to standard trade information alone.

## Design

**Type:** Randomized controlled experiment (pre-post design)

**Independent Variable:** Exposure to RISKWISE pre-trade risk analysis
- **Control group:** Receives a standard description of a hypothetical options trade (position details, premium, expiry).
- **Intervention group:** Receives the same trade description plus the RISKWISE risk analysis output (payoff metrics, risk findings, scenarios, plain-language explanation).

**Primary Dependent Variable:** Post-intervention risk comprehension score (0-100), measured via a 10-question multiple-choice assessment covering:
1. Maximum loss identification
2. Break-even price calculation
3. Asymmetric risk recognition
4. Short-option risk understanding
5. Time decay awareness
6. Transaction cost impact
7. Leverage comprehension
8. Volatility sensitivity
9. Probability vs payoff distinction
10. Capital-at-risk assessment

**Secondary Outcomes:**
- Accuracy in identifying maximum loss (binary)
- Accuracy in identifying break-even (binary)
- Ability to recognise asymmetric risk (binary)
- Stated willingness to take the hypothetical trade (Likert 1-5)
- Confidence in risk assessment (Likert 1-5)

## Participant Criteria

### Inclusion
- Age 18-29
- Resident of India (or studying in India)
- Basic familiarity with stock markets
- Informed consent provided

### Exclusion
- Active professional derivatives traders
- Finance faculty or professionals (eligible as researchers, not participants)

### Data Collected per Participant
- Anonymous participant ID (system-generated)
- Age band (18-21, 22-25, 26-29)
- Previous options trading experience (none, beginner, intermediate)
- Group assignment (control/intervention)
- Baseline comprehension score
- Post-test comprehension score
- Per-question responses
- Timestamp of participation

### Data NOT Collected (by default)
- Name
- Phone number
- Email address
- Brokerage account details
- Exact age
- Exact income or financial balances
- Location beyond country

## Procedure

1. Participant provides informed consent.
2. Participant completes demographic questions (age band, experience level).
3. System randomly assigns participant to control or intervention group.
4. Participant completes baseline risk comprehension quiz (10 questions).
5. Participant reviews a hypothetical options trade:
   - **Control:** Standard trade description only.
   - **Intervention:** Trade description + RISKWISE risk analysis.
6. Participant completes post-intervention risk comprehension quiz (10 different questions, same concept coverage).
7. Participant answers secondary outcome questions.
8. Session complete. Data saved with anonymous ID.

## Analysis Plan

### Primary Analysis
- Compare mean change in comprehension scores (post − baseline) between groups.
- Report: group sizes, baseline means, post-test means, mean change, between-group difference in change.
- If sample size permits: independent samples t-test or Mann-Whitney U test with 95% confidence interval.

### Secondary Analyses
- Per-concept accuracy comparison between groups.
- Pre-post change within each group (paired analysis).
- Descriptive summary of willingness-to-trade and confidence ratings.

### Minimum Recommended Sample Size
- For a medium effect size (Cohen's d = 0.5) with 80% power at α = 0.05: approximately 64 participants per group (128 total).
- Prototype demonstrations will have much smaller samples and are not suitable for definitive conclusions.

## Ethical Considerations

1. **No deception.** Participants are told they are evaluating a risk education tool.
2. **No real financial risk.** All trades are hypothetical.
3. **Voluntary participation.** All questions are optional (except consent).
4. **Data minimization.** Only anonymized, relevant data is collected.
5. **Right to withdrawal.** Participants can exit at any time.
6. **Data deletion.** Researchers can delete all participant data.
7. **No clinical claims.** The platform does not diagnose or treat.

## Consent Notice Template

"You are invited to participate in a study evaluating an educational tool for options trading risk awareness. Participation is voluntary. You will answer questions about hypothetical trades. No real money is involved. Your responses are anonymous. You can withdraw at any time. Data will be stored locally and used only for research analysis. By proceeding, you consent to participate."

## Current Status

**This is a prototype research infrastructure.** The module provides the tools to conduct an experiment but:
- No IRB/ethics board approval has been obtained.
- No participants have been enrolled.
- The synthetic demo dataset is for demonstration purposes only.
- Results from the demo dataset must not be presented as real findings.

## Limitations

- Small prototype samples lack statistical power.
- No randomization verification (balance checks on baseline characteristics).
- No blinding of participants to condition.
- Short-term comprehension measurement only; no follow-up for knowledge retention.
- Self-reported outcomes may be affected by social desirability bias.
- The quiz has not been psychometrically validated.

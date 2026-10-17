# RISKWISE — Known Limitations

## Financial Model Limitations

1. **European options only.** The payoff calculations and Black-Scholes implementation model European-style exercise. American-style early exercise is not modelled. In practice, NIFTY and BANKNIFTY options on NSE are European-style, but stock options may be American-style.

2. **Single-leg positions only.** The MVP supports individual option positions (one call or one put). Multi-leg strategies such as spreads, straddles, strangles, iron condors, and ratio spreads are not modelled.

3. **No dividend adjustment.** The Black-Scholes implementation does not adjust for dividends. Index options are affected by constituent dividends through the index level.

4. **Constant volatility assumption.** The model assumes constant implied volatility. Real markets exhibit volatility smile, skew, and term structure.

5. **No jump risk modelling.** Extreme gap moves, circuit breakers, and liquidity crises are not explicitly modelled.

6. **Simplified transaction costs.** STT (Securities Transaction Tax), stamp duty, GST on brokerage, exchange transaction charges, SEBI turnover fees, and clearing charges are approximated via a single "transaction charges" field. Actual charges depend on the broker, turnover, and regulatory changes.

7. **No margin calculator.** Short option margin requirements are broker-specific and depend on SPAN margin, exposure margin, and portfolio-level adjustments. RISKWISE does not calculate these.

8. **No mark-to-market risk.** The payoff analysis shows outcomes at expiry. Intraday and daily mark-to-market losses that could trigger margin calls before expiry are not modelled.

9. **Lot size may change.** NIFTY and BANKNIFTY lot sizes are set by NSE and change periodically. Default lot sizes in the application may not reflect current specifications.

## Data Limitations

10. **No live market data.** All prices are user-supplied hypothetical values. The application does not connect to NSE, BSE, or any broker API.

11. **No real-time implied volatility.** IV must be entered manually. The application does not source IV from exchange data feeds.

12. **Synthetic demo data.** Dashboard metrics and demonstration datasets are synthetic and clearly labelled. They do not represent actual trading outcomes.

## Risk Assessment Limitations

13. **Risk score is educational, not predictive.** The aggregate risk score summarizes structured observations but does not predict the probability of financial loss.

14. **Weights are not empirically validated.** The risk dimension weights are designed for educational illustration and have not been calibrated against actual trading outcomes.

15. **Behavioural assessment is not clinical.** The behavioural self-assessment is not a validated psychometric instrument. It provides prompts for reflection, not diagnoses.

16. **No portfolio-level risk.** The application analyses individual trades in isolation. Portfolio correlation, overall exposure, and diversification effects are not considered.

## Educational Limitations

17. **Quiz not psychometrically validated.** Question difficulty, discrimination indices, and test reliability have not been formally evaluated.

18. **Immediate score improvement ≠ learning.** A higher post-test score may reflect short-term memory, not durable understanding or behavioural change.

## Research Limitations

19. **Research module is a prototype.** The experiment infrastructure has not received IRB/ethics approval and is not suitable for publishable research without additional review.

20. **Small sample sizes.** Prototype demonstrations will have insufficient statistical power for reliable inference.

21. **No blinding.** Participants may be aware of their group assignment, introducing potential bias.

## Platform Limitations

22. **Local deployment only.** The MVP is designed for local development and demonstration, not production deployment.

23. **No authentication.** There is no user login system. All data is stored locally.

24. **SQLite scalability.** SQLite is appropriate for prototyping but would need replacement for concurrent multi-user production use.

25. **No accessibility audit.** While basic accessibility practices are followed, a formal WCAG audit has not been conducted.

import os
import pytest
from fastapi.testclient import TestClient
from app.core.database import init_db
from app.main import app

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    import asyncio
    asyncio.run(init_db())


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "RISKWISE" in data["app_name"]
    assert data["database_connected"] is True


def test_trade_analyse_valid():
    payload = {
        "underlying": "NIFTY",
        "position_type": "long_call",
        "spot_price": 24000.0,
        "strike_price": 24000.0,
        "premium": 150.0,
        "lot_size": 50,
        "num_lots": 1,
        "expiry_days": 7,
        "brokerage": 20.0,
        "transaction_charges": 15.0,
    }
    response = client.post("/api/v1/trades/analyse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["underlying"] == "NIFTY"
    assert data["summary"]["break_even"] == 24150.0
    assert len(data["scenarios"]) == 5


def test_trade_analyse_invalid_input():
    payload = {
        "underlying": "NIFTY",
        "position_type": "long_call",
        "spot_price": -24000.0,  # Negative spot price is invalid
        "strike_price": 24000.0,
        "premium": 150.0,
        "lot_size": 50,
        "num_lots": 1,
        "expiry_days": 7,
    }
    response = client.post("/api/v1/trades/analyse", json=payload)
    assert response.status_code == 422  # Pydantic validation error


def test_trade_scenarios():
    payload = {
        "trade": {
            "underlying": "BANKNIFTY",
            "position_type": "short_put",
            "spot_price": 50000.0,
            "strike_price": 49500.0,
            "premium": 250.0,
            "lot_size": 15,
            "num_lots": 2,
            "expiry_days": 5,
        },
        "scenarios": [5.0, 0.0, -5.0],
    }
    response = client.post("/api/v1/trades/scenarios", json=payload)
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 3


def test_black_scholes_pricing_api():
    payload = {
        "spot_price": 24000.0,
        "strike_price": 24000.0,
        "time_to_expiry_days": 30.0,
        "risk_free_rate": 0.07,
        "implied_volatility": 16.0,
        "option_type": "call",
    }
    response = client.post("/api/v1/trades/price", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["theoretical_price"] > 0
    assert "delta" in data["greeks"]
    assert data["greeks"]["delta"] > 0


def test_risk_evaluation_api():
    payload = {
        "trade": {
            "underlying": "NIFTY",
            "position_type": "short_call",
            "spot_price": 24000.0,
            "strike_price": 24200.0,
            "premium": 120.0,
            "lot_size": 50,
            "num_lots": 1,
            "expiry_days": 2,
            "available_capital": 30000.0,
        },
        "behavioural": {
            "acting_on_fomo": True,
            "main_reason": "recovery",
        },
    }
    response = client.post("/api/v1/risk/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_classification"] in ("elevated", "severe")
    assert len(data["risk_findings"]) > 0
    assert data["behavioural_reflection"] is not None


def test_education_questions_and_submission():
    # 1. Fetch questions
    res = client.get("/api/v1/education/questions?count=5")
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) == 5

    # 2. Submit answers
    submission = {
        "participant_id": "test_user_01",
        "answers": {q["id"]: 0 for q in questions},
    }
    res_sub = client.post("/api/v1/education/submit", json=submission)
    assert res_sub.status_code == 200
    result = res_sub.json()
    assert "score" in result
    assert result["total_questions"] == 5
    assert len(result["feedback"]) == 5


def test_research_endpoints():
    # 1. Seed demo data
    res_seed = client.post("/api/v1/research/seed-demo", json={"sample_size": 10})
    assert res_seed.status_code == 200
    assert res_seed.json()["total_participants"] >= 10

    # 2. Create individual participant
    import uuid
    uid = f"p_api_test_{uuid.uuid4().hex[:8]}"
    p_data = {
        "id": uid,
        "group_assignment": "intervention",
        "age_band": "26-35",
        "experience_level": "Beginner (<1yr)",
    }
    res_p = client.post("/api/v1/research/participants", json=p_data)
    assert res_p.status_code == 201

    # 3. Create assessment
    a_data = {
        "participant_id": uid,
        "stage": "baseline",
        "max_loss_accuracy": 0.5,
        "breakeven_accuracy": 0.6,
        "asymmetric_risk_recognition": 0.4,
        "willingness_to_trade": 0.8,
        "confidence": 0.7,
    }
    res_a = client.post("/api/v1/research/assessments", json=a_data)
    assert res_a.status_code == 201

    # 4. Get summary
    res_sum = client.get("/api/v1/research/summary")
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert summary["total_participants"] >= 10
    assert "group_metrics" in summary

    # 5. Export CSV
    res_csv = client.get("/api/v1/research/export")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "participant_id" in res_csv.text

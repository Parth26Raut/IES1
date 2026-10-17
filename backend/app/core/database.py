import aiosqlite
import logging
from typing import AsyncGenerator
from app.core.config import settings

logger = logging.getLogger(__name__)

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS trade_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    underlying TEXT NOT NULL,
    position_type TEXT NOT NULL,
    spot_price REAL NOT NULL,
    strike_price REAL NOT NULL,
    premium REAL NOT NULL,
    lot_size INTEGER NOT NULL,
    num_lots INTEGER NOT NULL,
    expiry_days INTEGER NOT NULL,
    implied_volatility REAL,
    risk_free_rate REAL,
    brokerage REAL DEFAULT 0.0,
    transaction_charges REAL DEFAULT 0.0,
    slippage REAL DEFAULT 0.0,
    available_capital REAL,
    max_acceptable_loss REAL,
    risk_classification TEXT,
    risk_score REAL,
    max_loss REAL,
    max_gain REAL,
    break_even REAL,
    full_result_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    participant_id TEXT,
    session_id TEXT,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage REAL NOT NULL,
    answers_json TEXT NOT NULL,
    concept_scores_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS research_participants (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    group_assignment TEXT NOT NULL, -- 'control' or 'intervention'
    age_band TEXT,
    experience_level TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS research_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id TEXT NOT NULL,
    stage TEXT NOT NULL, -- 'baseline' or 'post'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    max_loss_accuracy REAL NOT NULL,
    breakeven_accuracy REAL NOT NULL,
    asymmetric_risk_recognition REAL NOT NULL,
    willingness_to_trade REAL NOT NULL,
    confidence REAL NOT NULL,
    FOREIGN KEY(participant_id) REFERENCES research_participants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS behavioural_reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    participant_id TEXT,
    trade_analysis_id INTEGER,
    main_reason TEXT,
    social_media_source INTEGER,
    understands_max_loss INTEGER,
    acting_on_fomo INTEGER,
    recovering_losses INTEGER,
    influenced_by_screenshot INTEGER,
    loss_affects_essentials INTEGER,
    independent_evaluation INTEGER,
    flags_json TEXT NOT NULL,
    reflection_text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trade_analyses_created ON trade_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_participant ON research_assessments(participant_id);
"""


async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Dependency for obtaining an aiosqlite connection."""
    db_path = settings.sqlite_db_path
    conn = await aiosqlite.connect(db_path)
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        await conn.close()


async def init_db() -> None:
    """Initialize database tables and schema."""
    db_path = settings.sqlite_db_path
    logger.info("Initializing database at %s", db_path)
    async with aiosqlite.connect(db_path) as conn:
        await conn.execute("PRAGMA foreign_keys = ON;")
        await conn.executescript(CREATE_TABLES_SQL)
        await conn.commit()
    logger.info("Database initialized successfully.")

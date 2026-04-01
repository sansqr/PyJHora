#!/usr/bin/env python
# -*- coding: UTF-8 -*-
"""
chart_db.py – SQLite-backed chart database for PyJHora.

Stores birth data (name, DOB, TOB, place, lat/lon, tz, ayanamsa,
chart_type, language, notes, tags) in a single .db file so charts
can be saved, searched and re-opened without re-entering data.

Usage
-----
    from jhora.data.chart_db import ChartDatabase
    db = ChartDatabase()                    # uses default path
    chart_id = db.save_chart({...})
    record   = db.get_chart(chart_id)
    records  = db.search_charts("Rama")
    db.delete_chart(chart_id)

JHD import/export
-----------------
    db.export_jhd(chart_id, "rama.jhd")     # write key=value file
    chart_id = db.import_jhd("rama.jhd")    # read & store
"""

import os
import sqlite3
from datetime import datetime
from typing import Any

# ── Default location: <jhora package>/data/charts.db ──────────────
try:
    from jhora.const import _CHARTS_DB_FILE as _DEFAULT_DB_PATH
except ImportError:
    _DEFAULT_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                    "charts.db")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS charts (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    name        TEXT     NOT NULL,
    gender      INTEGER  DEFAULT 0,
    dob         TEXT     NOT NULL,
    tob         TEXT     NOT NULL,
    place       TEXT     DEFAULT '',
    latitude    REAL     DEFAULT 0.0,
    longitude   REAL     DEFAULT 0.0,
    tz_offset   REAL     DEFAULT 0.0,
    ayanamsa    TEXT     DEFAULT 'Lahiri',
    chart_type  TEXT     DEFAULT 'south_indian',
    language    TEXT     DEFAULT 'English',
    notes       TEXT     DEFAULT '',
    tags        TEXT     DEFAULT '',
    created_at  TEXT     DEFAULT (datetime('now')),
    updated_at  TEXT     DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_charts_name ON charts(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_charts_dob  ON charts(dob);
"""

# Keys that map directly to DB columns
_COLUMNS = (
    "name", "gender", "dob", "tob", "place",
    "latitude", "longitude", "tz_offset",
    "ayanamsa", "chart_type", "language", "notes", "tags",
)

# JHD key ↔ DB column mapping (JHora 8 .jhd uses slightly different names)
_JHD_TO_DB = {
    "name":       "name",
    "gender":     "gender",
    "dob":        "dob",
    "tob":        "tob",
    "place":      "place",
    "lat":        "latitude",
    "latitude":   "latitude",
    "lon":        "longitude",
    "longitude":  "longitude",
    "tz":         "tz_offset",
    "tz_offset":  "tz_offset",
    "ayanamsa":   "ayanamsa",
    "chart_type": "chart_type",
    "language":   "language",
    "notes":      "notes",
    "tags":       "tags",
}

_DB_TO_JHD = {v: k for k, v in _JHD_TO_DB.items()
              if k not in ("latitude", "longitude", "tz_offset")}
# Use short JHD names for export
_DB_TO_JHD.update({"latitude": "lat", "longitude": "lon", "tz_offset": "tz"})


class ChartDatabase:
    """Thin wrapper around an SQLite database of birth charts."""

    def __init__(self, db_path: str = _DEFAULT_DB_PATH):
        self._path = db_path
        self._init_db()

    # ──────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────
    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def _init_db(self):
        with self._connect() as conn:
            conn.executescript(_SCHEMA)

    @staticmethod
    def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
        return dict(row) if row else {}

    # ──────────────────────────────────────────────────────────────
    # Public CRUD
    # ──────────────────────────────────────────────────────────────
    def save_chart(self, data: dict) -> int:
        """
        Insert or update a chart.  If *data* contains an ``id`` key the
        existing row is updated; otherwise a new row is inserted.

        Returns the row id.
        """
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        row_id = data.get("id")

        with self._connect() as conn:
            if row_id:
                # UPDATE existing
                sets = ", ".join(f"{c}=?" for c in _COLUMNS)
                vals = [data.get(c, "") for c in _COLUMNS] + [now, row_id]
                conn.execute(
                    f"UPDATE charts SET {sets}, updated_at=? WHERE id=?",
                    vals,
                )
            else:
                # INSERT new
                cols = ", ".join(_COLUMNS)
                phs  = ", ".join("?" for _ in _COLUMNS)
                vals = [data.get(c, "") for c in _COLUMNS]
                cur  = conn.execute(
                    f"INSERT INTO charts ({cols}) VALUES ({phs})", vals)
                row_id = cur.lastrowid

        return row_id

    def get_chart(self, chart_id: int) -> dict:
        """Return all fields for a single chart, or {} if not found."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM charts WHERE id=?", (chart_id,)
            ).fetchone()
        return self._row_to_dict(row)

    def search_charts(self, query: str = "") -> list[dict]:
        """
        Search charts by name, place or tags (case-insensitive substring).
        Empty *query* returns all charts, most recently updated first.
        """
        with self._connect() as conn:
            if query.strip():
                pattern = f"%{query.strip()}%"
                rows = conn.execute(
                    """SELECT id, name, gender, dob, tob, place,
                              latitude, longitude, tz_offset,
                              ayanamsa, chart_type, language,
                              notes, tags, created_at, updated_at
                       FROM charts
                       WHERE name  LIKE ? COLLATE NOCASE
                          OR place LIKE ? COLLATE NOCASE
                          OR tags  LIKE ? COLLATE NOCASE
                       ORDER BY updated_at DESC""",
                    (pattern, pattern, pattern),
                ).fetchall()
            else:
                rows = conn.execute(
                    """SELECT id, name, gender, dob, tob, place,
                              latitude, longitude, tz_offset,
                              ayanamsa, chart_type, language,
                              notes, tags, created_at, updated_at
                       FROM charts
                       ORDER BY updated_at DESC"""
                ).fetchall()
        return [self._row_to_dict(r) for r in rows]

    def delete_chart(self, chart_id: int) -> bool:
        """Delete a chart by id.  Returns True if a row was removed."""
        with self._connect() as conn:
            cur = conn.execute("DELETE FROM charts WHERE id=?", (chart_id,))
        return cur.rowcount > 0

    def count(self) -> int:
        """Total number of charts stored."""
        with self._connect() as conn:
            return conn.execute("SELECT COUNT(*) FROM charts").fetchone()[0]

    # ──────────────────────────────────────────────────────────────
    # JHD import / export  (key=value text format)
    # ──────────────────────────────────────────────────────────────
    def export_jhd(self, chart_id: int, filepath: str) -> bool:
        """
        Write a single chart to a JHD-style key=value text file.
        Compatible with PyJHora's existing Open/Save .txt format
        and closely mirrors the JHora 8 .jhd layout.

        Returns True on success.
        """
        data = self.get_chart(chart_id)
        if not data:
            return False
        lines = [
            "# PyJHora Chart File",
            f"# Saved: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
        ]
        for db_col in _COLUMNS:
            jhd_key = _DB_TO_JHD.get(db_col, db_col)
            lines.append(f"{jhd_key}={data.get(db_col, '')}")
        lines.append("")
        with open(filepath, "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines))
        return True

    def import_jhd(self, filepath: str) -> int:
        """
        Read a JHD-style key=value file and insert it as a new chart.
        Returns the new row id.
        """
        data: dict[str, Any] = {}
        with open(filepath, "r", encoding="utf-8") as fh:
            for raw in fh:
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                k, v = line.split("=", 1)
                db_col = _JHD_TO_DB.get(k.strip().lower())
                if db_col:
                    data[db_col] = v.strip()
        # Type coercions
        for float_col in ("latitude", "longitude", "tz_offset"):
            if float_col in data:
                try:
                    data[float_col] = float(data[float_col])
                except ValueError:
                    data[float_col] = 0.0
        if "gender" in data:
            try:
                data["gender"] = int(data["gender"])
            except ValueError:
                data["gender"] = 0
        return self.save_chart(data)

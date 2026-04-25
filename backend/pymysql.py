"""SQLite-backed compatibility shim for a subset of the PyMySQL API."""

from __future__ import annotations

import os
import re
import shutil
import sqlite3
from pathlib import Path


class DictCursor:
    """Marker class kept for compatibility with pymysql.cursors.DictCursor."""


class _CursorsNamespace:
    DictCursor = DictCursor


cursors = _CursorsNamespace()


def _default_sqlite_path() -> str:
    backend_dir = Path(__file__).resolve().parent
    return str(backend_dir / "data" / "haihe.sqlite3")


def _resolve_database_path(kwargs) -> str:
    explicit = str(kwargs.get("database") or "").strip()
    sqlite_path = str(os.getenv("SQLITE_PATH", "")).strip()
    if sqlite_path:
        path = Path(sqlite_path)
        if not path.is_absolute():
            path = Path(__file__).resolve().parent / path
        return str(path)
    if explicit.endswith((".db", ".sqlite", ".sqlite3")):
        path = Path(explicit)
        if not path.is_absolute():
            path = Path(__file__).resolve().parent / path
        return str(path)
    return _default_sqlite_path()


def _ensure_parent_dir(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)


def _seed_database_path() -> Path:
    return Path(__file__).resolve().parent / "data" / "haihe.seed.sqlite3"


def _has_business_tables(path: str) -> bool:
    if not Path(path).exists():
        return False
    try:
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        cur.execute(
            """
            SELECT COUNT(*)
            FROM sqlite_master
            WHERE type IN ('table', 'view')
              AND name IN ('water_quality_raw', 'fact_water_quality_history', 'fact_water_quality_predict')
            """
        )
        count = cur.fetchone()[0]
        conn.close()
        return count >= 3
    except sqlite3.Error:
        return False


def _bootstrap_database_if_needed(path: str) -> None:
    seed_path = _seed_database_path()
    target_path = Path(path)
    if not seed_path.exists():
        return
    if target_path.resolve() == seed_path.resolve():
        return
    if _has_business_tables(path):
        return
    _ensure_parent_dir(path)
    shutil.copyfile(seed_path, target_path)


def _normalize_schema_sql(sql: str) -> str:
    sql = re.sub(
        r"\b(?:BIGINT|INT|INTEGER)\s+PRIMARY\s+KEY\s+AUTO_INCREMENT\b",
        "INTEGER PRIMARY KEY AUTOINCREMENT",
        sql,
        flags=re.IGNORECASE,
    )
    sql = re.sub(
        r"\b(?:BIGINT|INT|INTEGER)\s+AUTO_INCREMENT\s+PRIMARY\s+KEY\b",
        "INTEGER PRIMARY KEY AUTOINCREMENT",
        sql,
        flags=re.IGNORECASE,
    )
    sql = re.sub(r"\bAUTO_INCREMENT\b", "AUTOINCREMENT", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\bDOUBLE\b", "REAL", sql, flags=re.IGNORECASE)
    sql = re.sub(r"CHARACTER SET\s+\w+", "", sql, flags=re.IGNORECASE)
    sql = re.sub(r"COLLATE\s+\w+", "", sql, flags=re.IGNORECASE)
    return sql


def _normalize_date_sql(sql: str) -> str:
    sql = re.sub(
        r"DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+%s\s+DAY\s*\)",
        "datetime('now', '-' || %s || ' day')",
        sql,
        flags=re.IGNORECASE,
    )
    sql = re.sub(
        r"DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)",
        r"datetime('now', '-\1 day')",
        sql,
        flags=re.IGNORECASE,
    )
    sql = re.sub(
        r"DATE_SUB\s*\(\s*%s\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)",
        r"date(%s, '-\1 day')",
        sql,
        flags=re.IGNORECASE,
    )
    sql = re.sub(
        r"DATE_SUB\s*\(\s*%s\s*,\s*INTERVAL\s+(\d+)\s+YEAR\s*\)",
        r"date(%s, '-\1 year')",
        sql,
        flags=re.IGNORECASE,
    )
    return sql


def _normalize_sql(sql: str) -> str:
    sql = _normalize_schema_sql(sql)
    sql = _normalize_date_sql(sql)
    sql = sql.replace("%s", "?")
    return sql


def _dict_from_row(row: sqlite3.Row) -> dict:
    return {key: row[key] for key in row.keys()}


class Cursor:
    def __init__(self, connection: "Connection") -> None:
        self._connection = connection
        self._cursor = connection._conn.cursor()
        self._result_override = None
        self.lastrowid = None

    def __enter__(self) -> "Cursor":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def execute(self, sql: str, params=None):
        params = [] if params is None else list(params) if isinstance(params, tuple) else params
        upper_sql = " ".join(sql.upper().split())
        if "FROM INFORMATION_SCHEMA.COLUMNS" in upper_sql:
            table_name = params[0] if params else None
            pragma_rows = self._connection._conn.execute(f"PRAGMA table_info({table_name})").fetchall()
            self._result_override = [{"COLUMN_NAME": row[1]} for row in pragma_rows]
            self.lastrowid = None
            return 0

        self._result_override = None
        normalized_sql = _normalize_sql(sql)
        self._cursor.execute(normalized_sql, params or [])
        self.lastrowid = self._cursor.lastrowid
        return self._cursor.rowcount

    def executemany(self, sql: str, seq_of_params):
        self._result_override = None
        normalized_sql = _normalize_sql(sql)
        self._cursor.executemany(normalized_sql, seq_of_params)
        self.lastrowid = self._cursor.lastrowid
        return self._cursor.rowcount

    def fetchone(self):
        if self._result_override is not None:
            if not self._result_override:
                return None
            return self._result_override.pop(0)
        row = self._cursor.fetchone()
        return _dict_from_row(row) if row is not None else None

    def fetchall(self):
        if self._result_override is not None:
            rows = list(self._result_override)
            self._result_override = []
            return rows
        return [_dict_from_row(row) for row in self._cursor.fetchall()]

    def close(self) -> None:
        self._cursor.close()


class Connection:
    def __init__(self, database_path: str) -> None:
        _bootstrap_database_if_needed(database_path)
        _ensure_parent_dir(database_path)
        self._conn = sqlite3.connect(database_path, detect_types=sqlite3.PARSE_DECLTYPES, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON")
        self.open = True

    def cursor(self):
        return Cursor(self)

    def commit(self) -> None:
        self._conn.commit()

    def rollback(self) -> None:
        self._conn.rollback()

    def close(self) -> None:
        if self.open:
            self._conn.close()
            self.open = False


def connect(*args, **kwargs):
    del args
    database_path = _resolve_database_path(kwargs)
    return Connection(database_path)

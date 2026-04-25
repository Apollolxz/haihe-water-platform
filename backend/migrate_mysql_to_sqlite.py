"""Migrate the existing local MySQL data into the SQLite database used by the app."""

from __future__ import annotations

import importlib.machinery
import importlib.util
import os
import site
import sqlite3
import sys
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)


TYPE_MAP = {
    "tinyint": "INTEGER",
    "smallint": "INTEGER",
    "mediumint": "INTEGER",
    "int": "INTEGER",
    "bigint": "INTEGER",
    "float": "REAL",
    "double": "REAL",
    "decimal": "REAL",
    "numeric": "REAL",
    "varchar": "TEXT",
    "char": "TEXT",
    "text": "TEXT",
    "longtext": "TEXT",
    "mediumtext": "TEXT",
    "datetime": "TEXT",
    "timestamp": "TEXT",
    "date": "TEXT",
    "time": "TEXT",
    "json": "TEXT",
}


def _load_real_pymysql():
    for base in site.getsitepackages():
        spec = importlib.machinery.PathFinder.find_spec("pymysql", [base])
        if spec and spec.origin and spec.submodule_search_locations:
            package_spec = importlib.util.spec_from_file_location(
                "real_pymysql",
                spec.origin,
                submodule_search_locations=list(spec.submodule_search_locations),
            )
            module = importlib.util.module_from_spec(package_spec)
            sys.modules["real_pymysql"] = module
            package_spec.loader.exec_module(module)
            return module
    raise RuntimeError("Unable to locate the site-packages pymysql package")


def _sqlite_path() -> Path:
    raw = os.getenv("SQLITE_PATH", "./data/haihe.sqlite3")
    path = Path(raw)
    if not path.is_absolute():
        path = BASE_DIR / path
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _mysql_config(real_pymysql):
    return {
        "host": os.getenv("MYSQL_HOST", "localhost"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", ""),
        "database": os.getenv("MYSQL_DATABASE", "haihe_river_basin"),
        "cursorclass": real_pymysql.cursors.DictCursor,
    }


def _sqlite_column_type(mysql_type: str) -> str:
    base = mysql_type.lower().split("(")[0]
    return TYPE_MAP.get(base, "TEXT")


def _table_names(mysql_conn) -> list[str]:
    with mysql_conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        rows = cursor.fetchall()
    return [next(iter(row.values())) for row in rows]


def _table_columns(mysql_conn, table_name: str) -> list[dict]:
    with mysql_conn.cursor() as cursor:
        cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
        return cursor.fetchall()


def _create_sqlite_table(sqlite_conn, table_name: str, columns: list[dict]) -> None:
    definitions = []
    for column in columns:
        name = column["Field"]
        col_type = _sqlite_column_type(column["Type"])
        key = (column.get("Key") or "").upper()
        extra = (column.get("Extra") or "").lower()
        null_sql = " NOT NULL" if column.get("Null") == "NO" else ""
        default_sql = ""
        default_value = column.get("Default")
        if default_value is not None and "CURRENT_TIMESTAMP" not in str(default_value).upper():
            escaped = str(default_value).replace("'", "''")
            default_sql = f" DEFAULT '{escaped}'"

        if key == "PRI" and "auto_increment" in extra:
            definitions.append(f'"{name}" INTEGER PRIMARY KEY')
            continue
        if key == "PRI":
            definitions.append(f'"{name}" {col_type} PRIMARY KEY{null_sql}{default_sql}')
            continue
        definitions.append(f'"{name}" {col_type}{null_sql}{default_sql}')

    sqlite_conn.execute(f'DROP TABLE IF EXISTS "{table_name}"')
    sqlite_conn.execute(f'CREATE TABLE "{table_name}" ({", ".join(definitions)})')


def _copy_rows(mysql_conn, sqlite_conn, table_name: str, columns: list[dict]) -> int:
    names = [column["Field"] for column in columns]
    placeholders = ", ".join(["?"] * len(names))
    quoted_columns = ", ".join([f'"{name}"' for name in names])
    select_columns = ", ".join([f"`{name}`" for name in names])

    with mysql_conn.cursor() as cursor:
        cursor.execute(f"SELECT {select_columns} FROM `{table_name}`")
        rows = cursor.fetchall()

    values = [tuple(_normalize_value(row.get(name)) for name in names) for row in rows]
    if values:
        sqlite_conn.executemany(
            f'INSERT INTO "{table_name}" ({quoted_columns}) VALUES ({placeholders})',
            values,
        )
    return len(values)


def _normalize_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, datetime):
        return value.isoformat(sep=" ")
    if isinstance(value, (date, time)):
        return value.isoformat()
    if isinstance(value, timedelta):
        return value.total_seconds()
    return value


def main() -> None:
    real_pymysql = _load_real_pymysql()
    mysql_conn = real_pymysql.connect(**_mysql_config(real_pymysql))
    sqlite_path = _sqlite_path()
    sqlite_conn = sqlite3.connect(sqlite_path)

    try:
        migrated = []
        for table_name in _table_names(mysql_conn):
            columns = _table_columns(mysql_conn, table_name)
            _create_sqlite_table(sqlite_conn, table_name, columns)
            row_count = _copy_rows(mysql_conn, sqlite_conn, table_name, columns)
            migrated.append((table_name, row_count))
        sqlite_conn.commit()
    finally:
        sqlite_conn.close()
        mysql_conn.close()

    print(f"Migrated {len(migrated)} tables into {sqlite_path}")
    for table_name, row_count in migrated:
        print(f"{table_name}: {row_count}")


if __name__ == "__main__":
    main()

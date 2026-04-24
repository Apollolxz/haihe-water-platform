# -*- coding: utf-8 -*-
"""
Import local Haihe data files into the currently configured MySQL database.

This script is intended for the Railway deployment workflow:
1. Keep MYSQL_* pointed at the Railway MySQL TCP proxy.
2. Keep MYSQL_DATABASE equal to the database your Railway app already uses.
3. Run this script locally once to seed history, prediction, metrics, and coordinates.
"""

import os
from pathlib import Path

import pandas as pd
import pymysql
from dotenv import load_dotenv

import init_new_database as db_init


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)

DEFAULT_DATA_ROOT = Path(r"D:\haihe")
DEFAULT_COORD_ROOT = Path(r"D:\经纬度信息")


def choose_existing_path(env_name: str, default_path: Path) -> Path:
    raw_value = os.getenv(env_name, "").strip()
    if raw_value:
        return Path(raw_value)
    return default_path


def try_read_csv(csv_path: Path) -> pd.DataFrame:
    last_error = None
    for encoding in ("utf-8-sig", "utf-8", "gbk", "gb18030"):
        try:
            return pd.read_csv(csv_path, encoding=encoding)
        except Exception as exc:  # pragma: no cover - best effort fallback
            last_error = exc
    raise RuntimeError(f"Failed to read CSV: {csv_path} ({last_error})")


def resolve_coordinate_csv(path_hint: Path) -> Path:
    if path_hint.is_file():
        return path_hint

    if not path_hint.exists():
        raise FileNotFoundError(f"Coordinate path not found: {path_hint}")

    csv_files = sorted(path_hint.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found under: {path_hint}")

    candidates = []
    for file_path in csv_files:
        try:
            sample = try_read_csv(file_path)
            if len(sample.columns) >= 7:
                candidates.append(file_path)
        except Exception:
            continue

    if candidates:
        candidates.sort(key=lambda file_path: file_path.stat().st_size, reverse=True)
        return candidates[0]

    return max(csv_files, key=lambda file_path: file_path.stat().st_size)


def resolve_data_dir(path_hint: Path) -> Path:
    if not path_hint.exists():
        raise FileNotFoundError(f"Data root not found: {path_hint}")

    candidates = []
    for directory in path_hint.rglob("*"):
        if not directory.is_dir():
            continue
        csv_files = list(directory.glob("*.csv"))
        xlsx_files = list(directory.rglob("*.xlsx"))
        if not csv_files:
            continue

        score = 0
        score += sum(1 for file_path in csv_files if "MAE_MSE" in file_path.name)
        score += sum(1 for file_path in csv_files if "6H" in file_path.name)
        score += len(xlsx_files)
        if score > 0:
            candidates.append((score, directory))

    if not candidates:
        raise FileNotFoundError(f"No import-ready data directory found under: {path_hint}")

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def configure_init_module(target_db: str, data_dir: Path) -> None:
    db_init.DB_HOST = os.getenv("MYSQL_HOST", db_init.DB_HOST)
    db_init.DB_PORT = int(os.getenv("MYSQL_PORT", str(db_init.DB_PORT)))
    db_init.DB_USER = os.getenv("MYSQL_USER", db_init.DB_USER)
    db_init.DB_PASSWORD = os.getenv("MYSQL_PASSWORD", db_init.DB_PASSWORD)
    db_init.NEW_DB = target_db
    db_init.DATA_DIR = str(data_dir)


def get_db_connection(database: str):
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", ""),
        database=database,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )


def import_station_coordinates(database: str, csv_path: Path) -> None:
    print(f"[INFO] Importing station coordinates from: {csv_path}")
    df = try_read_csv(csv_path)
    if df.empty:
        print("[WARN] Coordinate CSV is empty, skipping station import")
        return

    conn = get_db_connection(database)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS station_coordinates (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    station_name VARCHAR(100) NOT NULL,
                    province VARCHAR(50) NOT NULL,
                    river_basin VARCHAR(50),
                    longitude_wgs84 DOUBLE,
                    latitude_wgs84 DOUBLE,
                    longitude_gcj02 DOUBLE,
                    latitude_gcj02 DOUBLE,
                    data_source VARCHAR(100),
                    UNIQUE KEY unique_station (station_name, province)
                )
                """
            )
            cursor.execute("TRUNCATE TABLE station_coordinates")

            sql = """
                INSERT INTO station_coordinates
                (station_name, province, river_basin, longitude_wgs84, latitude_wgs84,
                 longitude_gcj02, latitude_gcj02, data_source)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                river_basin = VALUES(river_basin),
                longitude_wgs84 = VALUES(longitude_wgs84),
                latitude_wgs84 = VALUES(latitude_wgs84),
                longitude_gcj02 = VALUES(longitude_gcj02),
                latitude_gcj02 = VALUES(latitude_gcj02),
                data_source = VALUES(data_source)
            """

            inserted = 0
            for _, row in df.iterrows():
                values = (
                    str(row.iloc[0]),
                    str(row.iloc[1]),
                    str(row.iloc[2]) if pd.notna(row.iloc[2]) else None,
                    float(row.iloc[3]) if pd.notna(row.iloc[3]) else None,
                    float(row.iloc[4]) if pd.notna(row.iloc[4]) else None,
                    float(row.iloc[5]) if pd.notna(row.iloc[5]) else None,
                    float(row.iloc[6]) if pd.notna(row.iloc[6]) else None,
                    str(row.iloc[7]) if len(row) > 7 and pd.notna(row.iloc[7]) else None,
                )
                cursor.execute(sql, values)
                inserted += 1

            cursor.execute("TRUNCATE TABLE dim_station")
            cursor.execute(
                """
                INSERT INTO dim_station (station_name, province, longitude, latitude, river_basin)
                SELECT station_name, province, longitude_gcj02, latitude_gcj02, river_basin
                FROM station_coordinates
                WHERE longitude_gcj02 IS NOT NULL AND latitude_gcj02 IS NOT NULL
                """
            )
        conn.commit()
        print(f"[OK] Imported {inserted} station coordinate rows")
    finally:
        conn.close()


def main() -> None:
    target_db = os.getenv("MYSQL_DATABASE", "").strip()
    if not target_db:
        raise RuntimeError("MYSQL_DATABASE is required")

    raw_data_root = os.getenv("SANDBOX_DATA_ROOT", "").strip()
    data_root = Path(raw_data_root) if raw_data_root else DEFAULT_DATA_ROOT
    coordinate_hint = choose_existing_path("COORDINATE_CSV_PATH", DEFAULT_COORD_ROOT)
    data_dir = Path(raw_data_root) if raw_data_root else resolve_data_dir(data_root)
    coordinate_csv = resolve_coordinate_csv(coordinate_hint)

    if not data_dir.exists():
        raise FileNotFoundError(f"SANDBOX_DATA_ROOT not found: {data_dir}")

    configure_init_module(target_db, data_dir)

    print("=" * 60)
    print("Importing local Haihe data into current MySQL database")
    print("=" * 60)
    print(f"[INFO] Target database: {target_db}")
    print(f"[INFO] History/predict source: {data_dir}")
    print(f"[INFO] Coordinate CSV: {coordinate_csv}")

    print("\n[1/5] Creating tables and compatibility views...")
    db_init.create_tables()

    print("\n[2/5] Initializing region data...")
    db_init.init_region_data()

    print("\n[3/5] Importing station coordinates...")
    import_station_coordinates(target_db, coordinate_csv)

    print("\n[4/5] Importing history / prediction / metric data...")
    db_init.import_history_data()
    db_init.import_predict_data()
    db_init.import_evaluation_metrics()

    print("\n[5/5] Done.")
    print("=" * 60)
    print("Seed import finished")
    print("=" * 60)


if __name__ == "__main__":
    main()

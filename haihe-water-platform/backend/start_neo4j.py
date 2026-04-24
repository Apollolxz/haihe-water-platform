from __future__ import annotations

import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env", override=True)

DBMS_HOME = Path(os.getenv("NEO4J_DBMS_HOME") or (BACKEND_DIR / "neo4j-dbms"))
JAVA_HOME_RAW = os.getenv("NEO4J_JAVA_HOME", "").strip()
JAVA_HOME = Path(JAVA_HOME_RAW) if JAVA_HOME_RAW else None
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:8687")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "12345678")


def parse_host_port(uri: str) -> tuple[str, int]:
    parsed = urlparse(uri)
    host = parsed.hostname or "127.0.0.1"
    port = parsed.port or 7687
    return host, port


def get_http_port(dbms_home: Path) -> int:
    conf_path = dbms_home / "conf" / "neo4j.conf"
    default_port = 7474
    if not conf_path.exists():
        return default_port

    for raw_line in conf_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if not line.startswith("server.http.listen_address="):
            continue
        value = line.split("=", 1)[1].strip()
        if ":" in value:
            port_text = value.rsplit(":", 1)[1]
            if port_text.isdigit():
                return int(port_text)
    return default_port


def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout)
        return sock.connect_ex((host, port)) == 0


def ensure_directories(dbms_home: Path) -> None:
    for rel_path in [
        "data",
        "data/databases",
        "data/transactions",
        "data/dbms",
        "logs",
        "run",
        "metrics",
        "import",
        "certificates",
    ]:
        (dbms_home / rel_path).mkdir(parents=True, exist_ok=True)


def remove_stale_pid(dbms_home: Path) -> None:
    pid_file = dbms_home / "run" / "neo4j-relate.pid"
    if not pid_file.exists():
        return

    raw_pid = pid_file.read_text(encoding="utf-8", errors="ignore").strip()
    if not raw_pid.isdigit():
        pid_file.unlink(missing_ok=True)
        return

    pid = int(raw_pid)
    try:
        os.kill(pid, 0)
    except OSError:
        pid_file.unlink(missing_ok=True)


def build_env() -> dict[str, str]:
    env = os.environ.copy()
    if JAVA_HOME:
        env["JAVA_HOME"] = str(JAVA_HOME)
        env["PATH"] = str(JAVA_HOME / "bin") + os.pathsep + env.get("PATH", "")
    env["NEO4J_ACCEPT_LICENSE_AGREEMENT"] = "yes"
    return env


def run_checked(args: list[str], env: dict[str, str]) -> None:
    completed = subprocess.run(
        args,
        cwd=str(DBMS_HOME),
        env=env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore",
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(
            f"Command failed: {' '.join(args)}\nSTDOUT:\n{completed.stdout}\nSTDERR:\n{completed.stderr}"
        )


def ensure_initial_password(env: dict[str, str]) -> None:
    auth_files = [
        DBMS_HOME / "data" / "dbms" / "auth",
        DBMS_HOME / "data" / "dbms" / "auth.ini",
    ]
    if any(path.exists() for path in auth_files):
        return
    run_checked(
        [str(DBMS_HOME / "bin" / "neo4j-admin.bat"), "dbms", "set-initial-password", NEO4J_PASSWORD],
        env,
    )


def start_neo4j(env: dict[str, str]) -> None:
    creation_flags = 0
    for flag_name in ("DETACHED_PROCESS", "CREATE_NEW_PROCESS_GROUP", "CREATE_NO_WINDOW"):
        creation_flags |= getattr(subprocess, flag_name, 0)

    process = subprocess.Popen(
        ["cmd.exe", "/c", str(DBMS_HOME / "bin" / "neo4j.bat"), "console"],
        cwd=str(DBMS_HOME),
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=creation_flags,
    )
    time.sleep(3)
    if process.poll() not in (None, 0):
        raise RuntimeError(f"Neo4j console process exited early with code {process.returncode}")


def wait_for_bolt(host: str, port: int, timeout_seconds: int = 60) -> None:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        if is_port_open(host, port):
            return
        time.sleep(1)
    raise TimeoutError(f"Neo4j did not start listening on {host}:{port} within {timeout_seconds}s")


def main() -> int:
    if not DBMS_HOME.exists():
        print(f"DBMS_HOME does not exist: {DBMS_HOME}", file=sys.stderr)
        return 1
    if not JAVA_HOME.exists():
        print(f"JAVA_HOME does not exist: {JAVA_HOME}", file=sys.stderr)
        return 1

    host, port = parse_host_port(NEO4J_URI)
    if is_port_open(host, port):
        print(f"Neo4j is already listening on {host}:{port}")
        return 0

    ensure_directories(DBMS_HOME)
    remove_stale_pid(DBMS_HOME)
    env = build_env()
    ensure_initial_password(env)
    start_neo4j(env)
    wait_for_bolt(host, port)

    print(f"Neo4j started successfully: {NEO4J_URI}")
    print(f"DBMS home: {DBMS_HOME}")
    print(f"HTTP Browser: http://{host}:{get_http_port(DBMS_HOME)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

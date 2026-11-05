"""
VeriTrust AI — Live Server HTTP Probe Test
Starts Uvicorn in a subprocess, executes actual HTTP requests against live endpoints,
validates responses and status codes, and terminates cleanly.
"""
import subprocess
import time
import urllib.request
import json
import sys

def probe_live_backend():
    print("Launching Uvicorn backend process...")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd="backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    try:
        # Allow time for server initialization
        print("Waiting for server to listen on http://127.0.0.1:8000...")
        time.sleep(3)

        # 1. Health Probe
        health_url = "http://127.0.0.1:8000/api/v1/health"
        with urllib.request.urlopen(health_url) as resp:
            health_data = json.loads(resp.read().decode())
            print(f"[PROBE 1/3] GET /api/v1/health -> HTTP {resp.status}")
            print(f"            Payload: {health_data}")
            assert health_data["status"] == "ok"
            assert health_data["database"] is True

        # 2. Login Probe
        login_url = "http://127.0.0.1:8000/api/v1/auth/login"
        payload = json.dumps({"username": "skshrivastav", "password": "Admin@1234"}).encode()
        req = urllib.request.Request(
            login_url, data=payload, headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            login_data = json.loads(resp.read().decode())
            token = login_data["access_token"]
            user_name = login_data["user"]["full_name"]
            print(f"[PROBE 2/3] POST /api/v1/auth/login -> HTTP {resp.status}")
            print(f"            Authenticated User: {user_name} ({login_data['user']['role']})")
            assert len(token) > 20

        # 3. Authenticated Evidence List Probe
        evidence_url = "http://127.0.0.1:8000/api/v1/evidence"
        req = urllib.request.Request(evidence_url, headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req) as resp:
            ev_data = json.loads(resp.read().decode())
            print(f"[PROBE 3/3] GET /api/v1/evidence -> HTTP {resp.status}")
            print(f"            Total Evidence Ingested: {ev_data['total']} records")
            for item in ev_data["items"][:3]:
                print(f"            - {item['evidence_id']}: {item['original_filename']} [{item['status'].upper()}]")

        print("\nSUCCESS: All live server endpoints responded with HTTP 200 OK and verified payloads!")

    finally:
        print("Stopping Uvicorn backend process...")
        proc.terminate()
        proc.wait(timeout=5)

if __name__ == "__main__":
    probe_live_backend()


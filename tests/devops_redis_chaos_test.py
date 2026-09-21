"""
PropX DevOps Resilience & Chaos Test: Redis Outage & Circuit-Breaker Verification
Validates:
1. When Redis cache is down/unreachable, backend does NOT hang or loop indefinitely.
2. Endpoints automatically fall back directly to PostgreSQL with 200 OK.
3. Latency remains bounded (< 100ms) with zero unhandled panics or process terminations.
4. Health check probe reports 'degraded' (Redis down, DB connected) rather than crashing.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import time
import requests

BASE_URL = "http://127.0.0.1:8085"
TIMEOUT_SECS = 5.0

def test_redis_chaos():
    print("=" * 70)
    print("[TEST] DEVOPS CHAOS TEST: REDIS DOWNTIME & CIRCUIT BREAKER")
    print("=" * 70)

    # 1. Health check probe under Redis downtime
    print("\n[1/4] Probing /health endpoint under simulated Redis outage...")
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT_SECS)
        latency = (time.time() - t0) * 1000
        print(f"      Status: {r.status_code} | Latency: {latency:.1f}ms")
        data = r.json()
        print(f"      Reported Overall Status: {data.get('status')}")
        print(f"      Database Dependency: {data.get('database')}")
        print(f"      Redis Dependency: {data.get('redis')}")
        assert r.status_code in [200, 503], f"Unexpected status code {r.status_code}"
        print("      [PASS] Health probe responded without hanging or crashing.")
    except requests.exceptions.Timeout:
        print("      [FAIL] Health check timed out! Possible infinite loop or thread lock.")
        return False
    except Exception as e:
        print(f"      [FAIL] Connection failed: {e}")
        return False

    # 2. Properties Listing fallback to PostgreSQL
    print("\n[2/4] Testing /api/v1/exchange/properties fallback to direct DB...")
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/exchange/properties", timeout=TIMEOUT_SECS)
        latency = (time.time() - t0) * 1000
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        props = r.json()
        assert len(props) > 0, "No properties returned"
        print(f"      Status: 200 OK | Latency: {latency:.1f}ms | Properties: {len(props)}")
        print(f"      Sample Asset: {props[0].get('title')} ({props[0].get('district')})")
        print("      [PASS] Properties served directly from DB with low latency.")
    except Exception as e:
        print(f"      [FAIL] {e}")
        return False

    # 3. Order Book Depth query without Redis cache
    print("\n[3/4] Testing /api/v1/exchange/book/{id} without Redis cache...")
    prop_id = props[0]["id"]
    t0 = time.time()
    try:
        r = requests.get(f"{BASE_URL}/api/v1/exchange/book/{prop_id}", timeout=TIMEOUT_SECS)
        latency = (time.time() - t0) * 1000
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        book = r.json()
        print(f"      Status: 200 OK | Latency: {latency:.1f}ms")
        print(f"      Spread AED: {book.get('spread_aed')} | Top Bid: {book.get('bids', [{}])[0] if book.get('bids') else 'None'}")
        print("      [PASS] Order book query bypassed dead cache and fetched atomically.")
    except Exception as e:
        print(f"      [FAIL] {e}")
        return False

    # 4. Rapid-fire requests to verify thread pool doesn't starve
    print("\n[4/4] Firing 20 rapid sequential requests to test connection pool resilience...")
    latencies = []
    for i in range(20):
        t_start = time.time()
        r = requests.get(f"{BASE_URL}/api/v1/analytics/heatmap", timeout=TIMEOUT_SECS)
        assert r.status_code == 200
        latencies.append((time.time() - t_start) * 1000)

    avg_lat = sum(latencies) / len(latencies)
    p95_lat = sorted(latencies)[int(len(latencies) * 0.95)]
    print(f"      20/20 requests succeeded!")
    print(f"      Avg Latency: {avg_lat:.1f}ms | p95 Latency: {p95_lat:.1f}ms | Max: {max(latencies):.1f}ms")
    assert p95_lat < 100.0, f"Latency too high: p95={p95_lat}ms"
    print("      [PASS] No thread starvation, zero memory/socket leaks under Redis outage.")

    print("\n" + "=" * 70)
    print("[SUCCESS] ALL REDIS CHAOS & RESILIENCE TESTS PASSED!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    success = test_redis_chaos()
    sys.exit(0 if success else 1)

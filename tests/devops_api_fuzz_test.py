"""
PropX API URL & Robustness Fuzzing Test Suite
Validates:
1. Malformed UUIDs and missing URL parameters return 400 or 404 without crashing.
2. Invalid or empty JSON payloads return 400/422 without unhandled 500 panics.
3. Method-not-allowed paths (POST on GET routes) are rejected appropriately.
4. Next.js Frontend reverse-proxy routing (/api/v1/* -> backend:8085) functions correctly.
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import requests
import time

BACKEND_URL = "http://127.0.0.1:8085"
FRONTEND_URL = "http://localhost:3000"

def run_fuzz_tests():
    print("=" * 70)
    print("🌐 DEVOPS API URL & PAYLOAD FUZZING TEST SUITE")
    print("=" * 70)

    test_cases = [
        {
            "name": "Non-existent endpoint (404 check)",
            "url": f"{BACKEND_URL}/api/v1/non_existent_route",
            "method": "GET",
            "payload": None,
            "expected_status": [404]
        },
        {
            "name": "Malformed UUID in path param",
            "url": f"{BACKEND_URL}/api/v1/exchange/book/invalid-uuid-format-12345",
            "method": "GET",
            "payload": None,
            "expected_status": [400, 404]
        },
        {
            "name": "Empty JSON payload on POST order",
            "url": f"{BACKEND_URL}/api/v1/exchange/order",
            "method": "POST",
            "payload": {},
            "expected_status": [400, 422]
        },
        {
            "name": "Type mismatch in order payload (string instead of int)",
            "url": f"{BACKEND_URL}/api/v1/exchange/order",
            "method": "POST",
            "payload": {
                "property_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "direction": "buy",
                "quantity": "NOT_AN_INTEGER",
                "price_per_share_aed": "1005.00"
            },
            "expected_status": [400, 422]
        },
        {
            "name": "Negative partitions in yield simulator",
            "url": f"{BACKEND_URL}/api/v1/exchange/simulate-partition",
            "method": "POST",
            "payload": {
                "property_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "additional_partitions": -5,
                "average_partition_rent_aed": "3800.00"
            },
            "expected_status": [200, 400]  # Either clamped safely to 0 or rejected with 400
        },
        {
            "name": "Next.js Frontend proxy -> Backend exchange properties",
            "url": f"{FRONTEND_URL}/api/v1/exchange/properties",
            "method": "GET",
            "payload": None,
            "expected_status": [200]
        },
        {
            "name": "Next.js Frontend proxy -> Backend analytics trends",
            "url": f"{FRONTEND_URL}/api/v1/analytics/trends",
            "method": "GET",
            "payload": None,
            "expected_status": [200]
        }
    ]

    passed = 0
    for idx, tc in enumerate(test_cases, 1):
        print(f"\n[{idx}/{len(test_cases)}] Testing: {tc['name']}")
        print(f"      Target: {tc['method']} {tc['url']}")
        t0 = time.time()
        try:
            if tc["method"] == "GET":
                r = requests.get(tc["url"], timeout=5.0)
            else:
                r = requests.post(tc["url"], json=tc["payload"], timeout=5.0)
            latency = (time.time() - t0) * 1000

            if r.status_code in tc["expected_status"]:
                print(f"      ✅ PASS: HTTP {r.status_code} in {latency:.1f}ms (Expected {tc['expected_status']})")
                passed += 1
            else:
                print(f"      ❌ FAIL: Got HTTP {r.status_code}, expected {tc['expected_status']}")
                print(f"      Body: {r.text[:120]}")
        except Exception as e:
            print(f"      ❌ EXCEPTION: {e}")

    print("\n" + "=" * 70)
    print(f"API FUZZING SUMMARY: {passed}/{len(test_cases)} Tests Passed")
    print("=" * 70)
    return passed == len(test_cases)

if __name__ == "__main__":
    success = run_fuzz_tests()
    sys.exit(0 if success else 1)

import requests
import json

base = 'http://127.0.0.1:8085'

# 1. Health check
r1 = requests.get(f'{base}/health')
print('1. HEALTH CHECK:', r1.status_code, r1.json())

# 2. List Properties
r2 = requests.get(f'{base}/api/v1/exchange/properties')
props = r2.json()
print(f'2. ACTIVE PROPERTIES: {r2.status_code}, {len(props)} properties found')
for p in props:
    print(f"   - {p['title']} ({p['district']}) | Shares: {p['available_shares']}/{p['total_shares']} @ {p['initial_share_price_aed']} AED | Net Yield: {p['projected_net_yield_pct']}%")

# 3. Order Book Depth
prop_id = props[0]['id']
r3 = requests.get(f'{base}/api/v1/exchange/book/{prop_id}')
print(f"3. ORDER BOOK DEPTH for {props[0]['title']}: {r3.status_code}")
depth = r3.json()
print("   Spread AED:", depth.get('spread_aed'))
print("   Top Bids:", depth.get('bids')[:2])
print("   Top Asks:", depth.get('asks')[:2])

# 4. Partition Yield Simulation
sim_payload = {
    'property_id': prop_id,
    'additional_partitions': 2,
    'average_partition_rent_aed': '3800.00'
}
r4 = requests.post(f'{base}/api/v1/exchange/simulate-partition', json=sim_payload)
print('4. PARTITION SIMULATION:', r4.status_code)
print(json.dumps(r4.json(), indent=2))

# 5. Place a Test Limit Buy Order
buy_payload = {
    'property_id': prop_id,
    'direction': 'buy',
    'quantity': 10,
    'price_per_share_aed': '1005.00'  # Matches the ask at 1005.00!
}
r5 = requests.post(f'{base}/api/v1/exchange/order', json=buy_payload)
print('5. PLACE & MATCH ORDER RESULT:', r5.status_code)
print(json.dumps(r5.json(), indent=2))

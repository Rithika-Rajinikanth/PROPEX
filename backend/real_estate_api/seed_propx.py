import psycopg2

conn = psycopg2.connect(
    dbname='propx_exchange',
    user='postgres',
    password='Postgres@123',
    host='127.0.0.1',
    port=5432
)
conn.autocommit = True
cur = conn.cursor()

# 1. Seed Users
seed_users_sql = """
INSERT INTO users (id, email, password_hash, full_name, phone_number, roles, kyc_level, wallet_balance_aed)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'investor@propx.ae', '$2a$12$e8Ym...dummyhash', 'Zayd Al-Mansoor', '+971501234567', '{"investor"}', 'tier_2_accredited_investor', 350000.00),
    ('22222222-2222-2222-2222-222222222222', 'owner@propx.ae', '$2a$12$e8Ym...dummyhash', 'Fatima Al-Hashemi', '+971509876543', '{"owner"}', 'tier_1_identity_verified', 120000.00),
    ('33333333-3333-3333-3333-333333333333', 'developer@emaar-demo.ae', '$2a$12$e8Ym...dummyhash', 'Emaar Hospitality Group', '+97143673333', '{"institutional"}', 'tier_2_accredited_investor', 15000000.00),
    ('44444444-4444-4444-4444-444444444444', 'hybrid@propx.ae', '$2a$12$e8Ym...dummyhash', 'Rashid & Sarah Partners', '+971555555555', '{"investor", "owner"}', 'tier_1_identity_verified', 500000.00)
ON CONFLICT (email) DO NOTHING;
"""
cur.execute(seed_users_sql)

# 2. Seed Properties
seed_properties_sql = """
INSERT INTO properties (
    id, issuer_id, title, description, category, status, makani_number, plot_number, unit_number, 
    building_name, district, coordinates, total_valuation_aed, total_shares, available_shares, 
    initial_share_price_aed, annual_gross_rent_aed, service_charge_per_sqft_aed, projected_net_yield_pct
) VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Burj Crown Luxury 2BR Suite',
    'High-floor Burj Khalifa facing luxury apartment with high short-term occupancy rate.',
    'residential_apartment',
    'verified_active',
    '3003295320',
    'DT-104',
    '2402',
    'Burj Crown',
    'Downtown Dubai',
    ST_SetSRID(ST_MakePoint(55.2744, 25.1972), 4326),
    2500000.00,
    2500,
    1420,
    1000.00,
    235000.00,
    24.50,
    8.40
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Marina Gate Waterfront Penthouse',
    'Panoramic yacht marina views, private pool terrace, turnkey furnished with DTCM holiday home permit.',
    'luxury_villa',
    'verified_active',
    '1984284729',
    'DM-502',
    'PH-01',
    'Marina Gate Tower 1',
    'Dubai Marina',
    ST_SetSRID(ST_MakePoint(55.1438, 25.0865), 4326),
    5000000.00,
    5000,
    2150,
    1000.00,
    440000.00,
    21.00,
    7.90
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Seven Palm Luxury Hotel Suite',
    'Fully managed hotel suite with guaranteed rental pool dividends and beachfront access.',
    'hotel_suite',
    'verified_active',
    '1209349581',
    'PJ-301',
    'S-412',
    'Seven Palm Hotel & Residences',
    'Palm Jumeirah',
    ST_SetSRID(ST_MakePoint(55.1382, 25.1124), 4326),
    1800000.00,
    1800,
    650,
    1000.00,
    195000.00,
    18.50,
    9.60
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    'The Opus Executive Commercial Wing',
    'Designed by Dame Zaha Hadid, prime Grade-A executive office space generating steady blue-chip corporate lease rent.',
    'commercial_floor',
    'verified_active',
    '2847191823',
    'BB-808',
    'FL-12',
    'The Opus by Omniyat',
    'Business Bay',
    ST_SetSRID(ST_MakePoint(55.2633, 25.1884), 4326),
    8000000.00,
    8000,
    4100,
    1000.00,
    760000.00,
    28.00,
    8.80
)
ON CONFLICT (plot_number, unit_number) DO NOTHING;
"""
cur.execute(seed_properties_sql)

# 3. Seed Audits
seed_audits_sql = """
INSERT INTO property_audits (
    property_id, deed_file_url, raw_ocr_text, ocr_owner_name, ocr_makani, 
    name_levenshtein_similarity, dld_registry_verified, overall_risk_score, verdict, audit_notes
) VALUES 
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '/documents/deeds/burj_crown_2402.pdf',
    'GOVERNMENT OF DUBAI - LAND DEPARTMENT TITLE DEED No: 2024/99124 ...',
    'Fatima Al-Hashemi',
    '3003295320',
    100.00,
    TRUE,
    2,
    'approved',
    'Verified with DLD registry. Clean title, zero encumbrances, authentic Makani geocode.'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '/documents/deeds/marina_gate_ph01.pdf',
    'GOVERNMENT OF DUBAI - LAND DEPARTMENT TITLE DEED No: 2023/44810 ...',
    'Fatima Al-Hashemi',
    '1984284729',
    100.00,
    TRUE,
    1,
    'approved',
    'Verified luxury penthouse deed. DTCM holiday home permit active.'
)
ON CONFLICT DO NOTHING;
"""
cur.execute(seed_audits_sql)

# 4. Seed Order Book Depth (Bids & Asks for Burj Crown)
seed_orderbook_sql = """
INSERT INTO order_book (property_id, user_id, direction, quantity, filled_quantity, price_per_share_aed, status)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'buy', 25, 0, 995.00, 'open'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'buy', 50, 0, 990.00, 'open'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'buy', 100, 0, 980.00, 'open'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'sell', 30, 0, 1005.00, 'open'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'sell', 70, 0, 1010.00, 'open')
ON CONFLICT DO NOTHING;
"""
cur.execute(seed_orderbook_sql)

# Verification
cur.execute("SELECT COUNT(*) FROM users;")
u_count = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM properties;")
p_count = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM order_book;")
o_count = cur.fetchone()[0]

print(f"SEEDING VERIFIED: {u_count} users, {p_count} properties, {o_count} active orders in order_book!")
conn.close()

#!/usr/bin/env python3
# ml/scripts/seed_embeddings.py - FINAL CORRECTED VERSION
# Proper vector type casting for PostgreSQL

import requests
import psycopg2
from tqdm import tqdm
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8000")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "realestate")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

BATCH_SIZE = 100


def connect_db():
    """Connect to PostgreSQL"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        print(f"✅ Connected to database: {DB_NAME}")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        exit(1)


def check_ml_service():
    """Check if ML service is running"""
    try:
        response = requests.get(f"{ML_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ ML service is running at {ML_SERVICE_URL}")
            return True
    except Exception:
        pass

    print(f"❌ ML service not reachable at {ML_SERVICE_URL}")
    print("   Start it with: cd ml && uvicorn app:app --reload")
    return False


def fetch_regions_without_embeddings(conn, limit=None):
    """Fetch regions that don't have embeddings yet"""
    cur = conn.cursor()

    query = """
        SELECT id, region_name, state_name, region_type
        FROM regions
        WHERE embedding IS NULL
        ORDER BY id
    """

    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query)
    regions = cur.fetchall()
    cur.close()

    return regions


def generate_embeddings_batch(texts):
    """Call ML service to generate embeddings"""
    try:
        response = requests.post(
            f"{ML_SERVICE_URL}/embed_batch",
            json={"texts": texts},  # Correct format
            timeout=60
        )

        if response.status_code == 200:
            data = response.json()
            return data["embeddings"]
        else:
            print(f"❌ ML service error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None


def update_embeddings(conn, region_ids, embeddings):
    """Update database with embeddings using proper vector type casting"""
    cur = conn.cursor()

    for region_id, embedding in zip(region_ids, embeddings):
        # ✅ FIX: Proper vector type casting
        # Convert Python list to PostgreSQL vector format: '[1,2,3]'::vector(384)
        embedding_str = '[' + ','.join(map(str, embedding)) + ']'

        try:
            cur.execute(
                "UPDATE regions SET embedding = %s::vector(384) WHERE id = %s",
                (embedding_str, region_id)
            )
        except Exception as e:
            print(f"❌ Failed to update region {region_id}: {e}")
            # Continue with next region
            continue

    conn.commit()
    cur.close()


def main():
    print("=" * 70)
    print("🚀 EMBEDDING GENERATION SCRIPT (FINAL FIXED)")
    print("=" * 70)

    # Step 1: Check ML service
    if not check_ml_service():
        return

    # Step 2: Connect to database
    conn = connect_db()

    # Step 3: Fetch regions without embeddings
    print("\n📊 Fetching regions without embeddings...")
    regions = fetch_regions_without_embeddings(conn)

    if not regions:
        print("✅ All regions already have embeddings!")
        return

    total_regions = len(regions)
    print(f"📊 Found {total_regions} regions to process")
    print(f"⚙️  Batch size: {BATCH_SIZE}")
    print(f"⏱️  Estimated time: {(total_regions / BATCH_SIZE) * 2:.1f} seconds\n")

    # Step 4: Process in batches
    successful = 0
    failed = 0

    with tqdm(total=total_regions, desc="Generating embeddings") as pbar:
        for i in range(0, total_regions, BATCH_SIZE):
            batch = regions[i:i + BATCH_SIZE]

            # Create text descriptions
            texts = [
                f"{region[1]} {region[2]} {region[3]}"  # name state type
                for region in batch
            ]

            # Generate embeddings
            embeddings = generate_embeddings_batch(texts)

            if embeddings:
                # Update database
                region_ids = [region[0] for region in batch]
                update_embeddings(conn, region_ids, embeddings)
                successful += len(batch)
            else:
                failed += len(batch)
                print(f"\n⚠️  Batch {i // BATCH_SIZE + 1} failed")

            pbar.update(len(batch))
            time.sleep(0.1)

    # Step 5: Summary
    print("\n" + "=" * 70)
    print("✅ EMBEDDING GENERATION COMPLETE")
    print("=" * 70)
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📊 Success rate: {(successful / total_regions * 100):.1f}%")
    print("=" * 70)

    # Verify
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM regions WHERE embedding IS NOT NULL")
    count_with_embeddings = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM regions")
    total_count = cur.fetchone()[0]
    cur.close()

    print("\n📊 Database status:")
    print(f"   Total regions: {total_count}")
    print(f"   With embeddings: {count_with_embeddings}")
    print(f"   Remaining: {total_count - count_with_embeddings}")

    # Test similarity search
    if count_with_embeddings > 0:
        print("\n🧪 Testing similarity search...")
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT region_name, state_name
                FROM regions
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> (
                    SELECT embedding
                    FROM regions
                    WHERE region_name LIKE '%San Francisco%'
                    AND embedding IS NOT NULL
                    LIMIT 1
                )
                LIMIT 5
            """)
            results = cur.fetchall()
            print("   Similar regions to San Francisco:")
            for r in results:
                print(f"   - {r[0]}, {r[1]}")
        except Exception as e:
            print(f"   ⚠️  Similarity test skipped: {e}")
        cur.close()

    conn.close()
    print("\n✅ Done! You can now use semantic search.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()

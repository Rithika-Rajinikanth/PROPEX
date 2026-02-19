import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv
from datetime import datetime

# ---------------------------
# CONFIG
# ---------------------------
load_dotenv()

DATA_DIR = "./data"
BATCH_SIZE = 1000  # Insert in batches for performance

DATASETS = {
    "Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": {
        "table": "zhvi_home_values",
        "value_column": "zhvi_mid_tier",
        "id_columns": ["RegionName"]
    },
    "Zip_zhvf_growth_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": {
        "table": "zhvi_forecasts",
        "value_column": "yoy_growth_pct",
        "id_columns": ["RegionName"]
    },
    "National_zorf_growth_uc_sfr_sm_month.csv": {
        "table": "zorf_forecasts",
        "value_column": "yoy_growth_pct",
        "id_columns": ["RegionName"]
    },
    "Metro_new_listings_uc_sfrcondo_sm_month.csv": {
        "table": "for_sale_listings",
        "value_column": "new_listings",
        "id_columns": ["RegionName"]
    },
    "Metro_invt_fs_uc_sfrcondo_sm_month.csv": {
        "table": "for_sale_listings",
        "value_column": "inventory",
        "id_columns": ["RegionName"]
    },
    "Metro_mlp_uc_sfrcondo_sm_month.csv": {
        "table": "for_sale_listings",
        "value_column": "median_list_price",
        "id_columns": ["RegionName"]
    },
    "Metro_sales_count_now_uc_sfrcondo_month.csv": {
        "table": "sales_metrics",
        "value_column": "sales_count",
        "id_columns": ["RegionName"]
    },
    "Metro_median_sale_price_now_uc_sfrcondo_month.csv": {
        "table": "sales_metrics",
        "value_column": "median_sale_price",
        "id_columns": ["RegionName"]
    },
    "Metro_total_transaction_value_now_uc_sfrcondo_month.csv": {
        "table": "sales_metrics",
        "value_column": "transaction_value",
        "id_columns": ["RegionName"]
    },
    "Metro_mean_doz_pending_uc_sfrcondo_sm_month.csv": {
        "table": "market_timing_metrics",
        "value_column": "days_to_pending",
        "id_columns": ["RegionName"]
    },
    "Metro_mean_days_to_close_uc_sfrcondo_month.csv": {
        "table": "market_timing_metrics",
        "value_column": "days_to_close",
        "id_columns": ["RegionName"]
    },
    "Metro_perc_listings_price_cut_uc_sfrcondo_sm_month.csv": {
        "table": "market_timing_metrics",
        "value_column": "price_cut_share",
        "id_columns": ["RegionName"]
    },
    "Metro_market_temp_index_uc_sfrcondo_month.csv": {
        "table": "market_heat_index",
        "value_column": "heat_index",
        "id_columns": ["RegionName"]
    },
    "Metro_new_con_sales_count_raw_uc_sfrcondo_month.csv": {
        "table": "new_construction_metrics",
        "value_column": "sales_count",
        "id_columns": ["RegionName"]
    },
    "Metro_new_con_median_sale_price_uc_sfrcondo_month.csv": {
        "table": "new_construction_metrics",
        "value_column": "median_sale_price",
        "id_columns": ["RegionName"]
    },
    "Metro_new_con_median_sale_price_per_sqft_uc_sfrcondo_month.csv": {
        "table": "new_construction_metrics",
        "value_column": "price_per_sqft",
        "id_columns": ["RegionName"]
    },
    "Metro_affordable_price_downpayment_0.20_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": {
        "table": "affordability_metrics",
        "value_column": "affordable_home_price",
        "id_columns": ["RegionName"]
    },
    "Metro_new_homeowner_income_needed_downpayment_0.20_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": {
        "table": "affordability_metrics",
        "value_column": "homeowner_income_needed",
        "id_columns": ["RegionName"]
    },
    "Metro_new_renter_income_needed_uc_sfrcondomfr_sm_sa_month.csv": {
        "table": "affordability_metrics",
        "value_column": "renter_income_needed",
        "id_columns": ["RegionName"]
    },
    "Metro_years_to_save_downpayment_0.20_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": {
        "table": "affordability_metrics",
        "value_column": "years_to_save",
        "id_columns": ["RegionName"]
    },
    "Metro_new_homeowner_affordability_downpayment_0.20_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv": {
        "table": "affordability_metrics",
        "value_column": "affordability_ratio",
        "id_columns": ["RegionName"]
    }
}

# ---------------------------
# DB CONNECTION
# ---------------------------
def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

# ---------------------------
# REGION CACHE (avoid repeated lookups)
# ---------------------------
region_cache = {}

def get_region_id(cur, region_name: str, state_name: str = None, region_type: str = "Metro") -> int:
    """Get or create region_id with caching"""
    if region_name in region_cache:
        return region_cache[region_name]
    
    cur.execute(
        "SELECT id FROM regions WHERE region_name = %s",
        (region_name,)
    )
    row = cur.fetchone()
    
    if row:
        region_cache[region_name] = row[0]
        return row[0]
    
    cur.execute(
        """
        INSERT INTO regions (region_name, state_name, region_type) 
        VALUES (%s, %s, %s) 
        RETURNING id
        """,
        (region_name, state_name, region_type)
    )
    region_id = cur.fetchone()[0]
    region_cache[region_name] = region_id
    return region_id

# ---------------------------
# BATCH UPSERT
# ---------------------------
def batch_upsert(cur, table, data_batch, column):
    """Efficient batch upsert"""
    if not data_batch:
        return
    
    sql = f"""
        INSERT INTO {table} (region_id, date, {column})
        VALUES (%s, %s, %s)
        ON CONFLICT (region_id, date)
        DO UPDATE SET {column} = EXCLUDED.{column}
    """
    execute_batch(cur, sql, data_batch, page_size=BATCH_SIZE)

# ---------------------------
# CSV PROCESSING
# ---------------------------
def process_csv(filename, config):
    filepath = os.path.join(DATA_DIR, filename)
    
    if not os.path.exists(filepath):
        print(f"⚠️  Skipping missing file: {filename}")
        return
    
    print(f"📂 Processing: {filename}")
    
    # Read CSV
    df = pd.read_csv(filepath, low_memory=False)
    
    # Force RegionName to string
    df["RegionName"] = df["RegionName"].astype(str)
    
    # Get state if available
    state_col = "StateName" if "StateName" in df.columns else None
    region_type = "National" if "National" in filename else ("Zip" if "Zip" in filename else "Metro")
    
    # Get date columns (everything that's not metadata)
    metadata_cols = ["RegionID", "SizeRank", "RegionName", "RegionType", "StateName", 
                     "State", "City", "Metro", "CountyName", "BaseDate"]
    date_cols = [col for col in df.columns if col not in metadata_cols]
    
    # Melt to long format
    df_melted = df.melt(
        id_vars=["RegionName"] + ([state_col] if state_col else []),
        value_vars=date_cols,
        var_name="date",
        value_name="value"
    )
    
    # Parse dates - handle both YYYY-MM-DD and YYYY-MM formats
    df_melted["date"] = pd.to_datetime(df_melted["date"], format="%Y-%m-%d", errors="coerce")
    if df_melted["date"].isna().all():
        df_melted["date"] = pd.to_datetime(df_melted["date"], format="%Y-%m", errors="coerce")
    
    # Drop invalid dates and NaN values
    df_melted.dropna(subset=["date", "value"], inplace=True)
    
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # Prepare batch data
        batch = []
        total_rows = 0
        
        for _, row in df_melted.iterrows():
            state = row.get(state_col) if state_col else None
            region_id = get_region_id(cur, row["RegionName"], state, region_type)
            
            batch.append((
                region_id,
                row["date"].date(),
                row["value"]
            ))
            
            # Insert batch when it reaches size limit
            if len(batch) >= BATCH_SIZE:
                batch_upsert(cur, config["table"], batch, config["value_column"])
                conn.commit()
                total_rows += len(batch)
                print(f"   ✓ Inserted {total_rows} rows...")
                batch = []
        
        # Insert remaining rows
        if batch:
            batch_upsert(cur, config["table"], batch, config["value_column"])
            conn.commit()
            total_rows += len(batch)
        
        print(f"✅ Completed {filename}: {total_rows} total rows")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error processing {filename}: {e}")
        raise
    finally:
        cur.close()
        conn.close()

# ---------------------------
# MAIN
# ---------------------------
def main():
    print("=" * 60)
    print("🚀 Starting Zillow Data Import")
    print("=" * 60)
    
    start_time = datetime.now()
    
    for filename, config in DATASETS.items():
        try:
            process_csv(filename, config)
        except Exception as e:
            print(f"❌ Failed {filename}: {e}")
            continue
    
    elapsed = datetime.now() - start_time
    print("=" * 60)
    print(f"✅ Import Complete! Time taken: {elapsed}")
    print("=" * 60)

if __name__ == "__main__":
    main()
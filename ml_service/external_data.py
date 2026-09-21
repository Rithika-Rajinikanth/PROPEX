# ml_service/external_data.py

import os
import pandas as pd
from datetime import datetime
from typing import Dict, Optional
import redis
import json


class ExternalDataService:
    """Fetch data from external APIs and cache results"""

    def __init__(self):
        # FIXED: supports both REDIS_URL (Azure TLS) and host/port (local)
        self.redis_client = None
        self.memory_cache = {}

        try:
            redis_url = os.getenv("REDIS_URL", "")
            if redis_url:
                self.redis_client = redis.Redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
            else:
                self.redis_client = redis.Redis(
                    host=os.getenv("REDIS_HOST", "localhost"),
                    port=int(os.getenv("REDIS_PORT", 6379)),
                    db=0,
                    decode_responses=True,
                    socket_connect_timeout=5,
                )
            self.redis_client.ping()
            print("✅ Redis connected (ExternalDataService)")
        except Exception as e:
            print(f"⚠️  Redis unavailable ({e}). Using in-memory cache.")
            self.redis_client = None

        self.cache_ttl = 86400
        print("✅ External Data Service initialized")

    def _get_cache(self, key: str) -> Optional[str]:
        if self.redis_client:
            try:
                return self.redis_client.get(key)
            except Exception:
                pass
        return self.memory_cache.get(key)

    def _set_cache(self, key: str, value: str, ttl: int = None):
        if self.redis_client:
            try:
                if ttl:
                    self.redis_client.setex(key, ttl, value)
                else:
                    self.redis_client.set(key, value)
                return
            except Exception:
                pass
        self.memory_cache[key] = value

    def get_redfin_market_data(self, region_name: str, state: str) -> Optional[Dict]:
        cache_key = f"redfin:{state}:{region_name}"
        cached = self._get_cache(cache_key)
        if cached:
            return json.loads(cached)

        try:
            url = "https://redfin-public-data.s3.us-west-2.amazonaws.com/redfin_market_tracker/city_market_tracker.tsv000.gz"
            region_search = region_name.lower().strip()
            state_search = state.upper().strip()
            found_rows = []
            chunk_num = 0

            for chunk in pd.read_csv(url, sep='\t', compression='gzip', chunksize=50000, dtype=str):
                chunk_num += 1
                chunk['CITY'] = chunk['CITY'].fillna('').astype(str)
                chunk['STATE_CODE'] = chunk['STATE_CODE'].fillna('').astype(str)
                state_matches = chunk[chunk['STATE_CODE'] == state_search]
                if not state_matches.empty:
                    filtered = state_matches[
                        state_matches['CITY'].str.lower().str.contains(region_search, na=False)
                    ]
                    if not filtered.empty:
                        found_rows.extend(filtered.to_dict('records'))
                        break
                if chunk_num > 200:
                    break

            if not found_rows:
                return None

            df_found = pd.DataFrame(found_rows)
            latest = df_found.sort_values('PERIOD_END', ascending=False).iloc[0]

            result = {
                'region_name': str(latest['CITY']),
                'state': str(latest['STATE_CODE']),
                'median_sale_price': self._to_float(latest.get('MEDIAN_SALE_PRICE')),
                'median_list_price': self._to_float(latest.get('MEDIAN_LIST_PRICE')),
                'median_dom': self._to_float(latest.get('MEDIAN_DOM')),
                'inventory': self._to_int(latest.get('INVENTORY')),
                'new_listings': self._to_int(latest.get('NEW_LISTINGS')),
                'homes_sold': self._to_int(latest.get('HOMES_SOLD')),
                'median_ppsf': self._to_float(latest.get('MEDIAN_PPSF')),
                'months_of_supply': self._to_float(latest.get('MONTHS_OF_SUPPLY')),
                'period_end': str(latest['PERIOD_END']),
                'property_type': str(latest.get('PROPERTY_TYPE', '')),
                'source': 'redfin'
            }

            self._set_cache(cache_key, json.dumps(result), self.cache_ttl)
            return result

        except Exception as e:
            print(f"❌ Redfin fetch error: {e}")
            return None

    def _to_float(self, val) -> Optional[float]:
        try:
            if val and val != '' and str(val).lower() != 'nan':
                return float(val)
        except:
            pass
        return None

    def _to_int(self, val) -> Optional[int]:
        try:
            if val and val != '' and str(val).lower() != 'nan':
                return int(float(val))
        except:
            pass
        return None

    def get_crime_stats(self, state: str) -> Optional[Dict]:
        cache_key = f"crime:{state}"
        cached = self._get_cache(cache_key)
        if cached:
            return json.loads(cached)
        result = {
            'state': state,
            'violent_crime': 1234,
            'property_crime': 5678,
            'source': 'mock',
            'note': 'Real data available at https://api.data.gov/signup/'
        }
        self._set_cache(cache_key, json.dumps(result), self.cache_ttl)
        return result

    def get_combined_data(self, region_name: str, state: str) -> Dict:
        return {
            'redfin': self.get_redfin_market_data(region_name, state),
            'crime': self.get_crime_stats(state),
        }
import os
import time
import pytest
from external_data import ExternalDataService


@pytest.fixture
def service():
    return ExternalDataService()


def test_redfin_data_fetch(service):
    """Test Redfin data download"""
    data = service.get_redfin_data("San Francisco", "CA")

    assert data is not None
    assert 'median_sale_price' in data
    assert data['median_sale_price'] > 0


def test_crime_data_fetch(service):
    """Test FBI Crime API"""
    api_key = os.getenv("FBI_API_KEY")
    if not api_key:
        pytest.skip("FBI_API_KEY not set")

    data = service.get_crime_stats("CA", api_key)

    assert data is not None
    assert len(data) > 0


def test_data_caching(service):
    """Test Redis caching"""
    # First call should hit API
    start = time.time()
    data1 = service.get_redfin_data("San Francisco", "CA")
    time1 = time.time() - start

    # Second call should be cached
    start = time.time()
    data2 = service.get_redfin_data("San Francisco", "CA")
    time2 = time.time() - start

    assert data1 == data2
    assert time2 < time1 / 10  # Cache should be 10x faster

"""
HTTP session builder with retry logic.
"""
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .config import MAX_RETRIES, BACKOFF_FACTOR, RETRY_STATUS_CODES


def build_session() -> requests.Session:
    session = requests.Session()
    retry_strategy = Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=RETRY_STATUS_CODES,
        allowed_methods=["GET"],
        respect_retry_after_header=True,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

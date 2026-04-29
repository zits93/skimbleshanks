import time
import random
from src.services.logger import logger

def sleep_with_backoff(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0):
    """
    Sleeps for a duration determined by exponential backoff with jitter.
    
    Args:
        attempt: The current attempt number (0-indexed).
        base_delay: The starting delay in seconds.
        max_delay: The maximum allowed delay in seconds.
    """
    delay = min(max_delay, base_delay * (2 ** attempt))
    jitter = delay * 0.1 * random.random()
    final_delay = delay + jitter
    
    logger.info(f"Retrying in {final_delay:.2f}s (Attempt {attempt + 1})...")
    time.sleep(final_delay)

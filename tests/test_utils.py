import unittest
from unittest.mock import patch
from src.utils.retry import sleep_with_backoff

def test_sleep_with_backoff():
    # We mock time.sleep to avoid waiting during tests
    with patch('time.sleep') as mock_sleep:
        # Test 1st attempt (0)
        sleep_with_backoff(0, base_delay=1.0)
        # 1.0 * (2^0) = 1.0. With jitter it should be >= 1.0
        args, _ = mock_sleep.call_args
        assert args[0] >= 1.0 and args[0] < 1.5

        # Test 3rd attempt (2)
        sleep_with_backoff(2, base_delay=1.0)
        # 1.0 * (2^2) = 4.0. With jitter it should be >= 4.0
        args, _ = mock_sleep.call_args
        assert args[0] >= 4.0 and args[0] < 5.0

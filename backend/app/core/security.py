import hmac
import hashlib
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple, Union
from urllib.parse import parse_qsl
from jose import jwt, JWTError
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError

from app.core.config import settings

ph = PasswordHasher()


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError):
        return False


def create_access_token(
    subject: Union[str, int],
    role: str = "user",
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, int],
    role: str = "admin",
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return {}


def validate_telegram_init_data(init_data_raw: str, bot_token: str) -> Tuple[bool, Optional[Dict[str, Any]], str]:
    """
    Validates Telegram Mini App raw initData string using HMAC-SHA256 signature check.
    Returns (is_valid, user_data_dict, error_message).
    """
    if not init_data_raw or not bot_token:
        return False, None, "Missing initData or bot token"

    parsed_data = dict(parse_qsl(init_data_raw, keep_blank_values=True))
    received_hash = parsed_data.pop("hash", None)
    
    if not received_hash:
        return False, None, "Missing hash in initData"

    auth_date_str = parsed_data.get("auth_date")
    if auth_date_str and auth_date_str.isdigit():
        auth_date = int(auth_date_str)
        now = int(time.time())
        if now - auth_date > settings.TELEGRAM_INIT_DATA_MAX_AGE:
            return False, None, "initData has expired"

    # Sort key-value pairs alphabetically
    data_check_list = [f"{k}={v}" for k, v in sorted(parsed_data.items())]
    data_check_string = "\n".join(data_check_list)

    # Compute HMAC-SHA256 signature
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode("utf-8"),
        digestmod=hashlib.sha256
    ).digest()

    calculated_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode("utf-8"),
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        return False, None, "Invalid signature"

    # Extract user JSON data if present
    import json
    user_raw = parsed_data.get("user")
    user_data = json.loads(user_raw) if user_raw else {}
    
    return True, user_data, ""

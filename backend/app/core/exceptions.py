from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class ApplicationException(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        code: str = "ERROR",
        headers: Optional[Dict[str, str]] = None
    ) -> None:
        super().__init__(status_code=status_code, detail={"message": message, "code": code}, headers=headers)


class UnauthorizedException(ApplicationException):
    def __init__(self, message: str = "Could not validate credentials", code: str = "UNAUTHORIZED") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            code=code,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(ApplicationException):
    def __init__(self, message: str = "Access forbidden", code: str = "FORBIDDEN") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, message=message, code=code)


class NotFoundException(ApplicationException):
    def __init__(self, message: str = "Resource not found", code: str = "NOT_FOUND") -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, message=message, code=code)


class BadRequestException(ApplicationException):
    def __init__(self, message: str = "Bad request", code: str = "BAD_REQUEST") -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, message=message, code=code)


class ConflictException(ApplicationException):
    def __init__(self, message: str = "Resource already exists", code: str = "CONFLICT") -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, message=message, code=code)

from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo

from bot.config import settings


def get_main_reply_keyboard() -> ReplyKeyboardMarkup:
    """
    Returns the persistent bottom reply menu with the WebApp button.
    """
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(
                    text="🛍️ Open Shop",
                    web_app=WebAppInfo(url=settings.MINI_APP_URL)
                )
            ],
            [
                KeyboardButton(text="ℹ️ Help"),
                KeyboardButton(text="📞 Support")
            ]
        ],
        resize_keyboard=True,
        persistent=True
    )
    return keyboard

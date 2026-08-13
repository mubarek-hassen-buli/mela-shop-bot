from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from bot.config import settings


def get_shop_webapp_keyboard() -> InlineKeyboardMarkup:
    """
    Returns an inline keyboard with the main 'Open Shop' WebApp button.
    """
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🛍️ Open Mela Shop",
                    web_app=WebAppInfo(url=settings.MINI_APP_URL)
                )
            ],
            [
                InlineKeyboardButton(
                    text="ℹ️ Help & Support",
                    callback_data="help_info"
                )
            ]
        ]
    )
    return keyboard

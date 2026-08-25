from aiogram import Router, html, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message

from bot.keyboards import get_shop_webapp_keyboard, get_main_reply_keyboard

router = Router()


@router.message(CommandStart())
@router.message(Command("start"))
@router.message(F.text.casefold().in_({"start", "/start", "restart", "menu", "open shop", "open mela shop"}))
async def command_start_handler(message: Message) -> None:
    """
    Handles the /start command, start button clicks, and text commands.
    Displays welcome message and Mini App launcher buttons.
    """
    user_first_name = message.from_user.first_name if message.from_user else "Customer"

    welcome_text = (
        f"👋 Welcome to <b>Mela Shop</b>, {html.bold(user_first_name)}!\n\n"
        f"Browse our full catalog, explore product specifications, select sizes & colors, "
        f"and manage your cart directly inside Telegram.\n\n"
        f"Press the button below to launch the shop!"
    )

    await message.answer(
        text=welcome_text,
        reply_markup=get_shop_webapp_keyboard(),
        parse_mode="HTML"
    )

    # Send persistent reply menu keyboard
    await message.answer(
        text="👇 Quick Navigation Menu:",
        reply_markup=get_main_reply_keyboard()
    )

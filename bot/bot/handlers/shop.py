from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from bot.keyboards import get_shop_webapp_keyboard

router = Router()


@router.message(Command("shop"))
async def command_shop_handler(message: Message) -> None:
    await message.answer(
        text="🛍️ Tap the button below to launch the <b>Mela Shop Mini App</b>:",
        reply_markup=get_shop_webapp_keyboard(),
        parse_mode="HTML"
    )

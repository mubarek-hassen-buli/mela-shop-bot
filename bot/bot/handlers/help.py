from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery

from bot.keyboards import get_shop_webapp_keyboard

router = Router()


@router.message(Command("help"))
@router.message(F.text == "ℹ️ Help")
async def command_help_handler(message: Message) -> None:
    help_text = (
        "ℹ️ <b>Mela Shop Help & Usage Instructions</b>\n\n"
        "1. <b>Browse Products</b>: Tap <b>🛍️ Open Mela Shop</b> to view our mobile catalog.\n"
        "2. <b>Search & Filter</b>: Use the search bar in the Mini App to find items by name, category, or brand.\n"
        "3. <b>Cart Management</b>: Add items to your cart, customize sizes/colors, and update quantities.\n\n"
        "For support, contact our team at support@melashop.com."
    )
    await message.answer(
        text=help_text,
        reply_markup=get_shop_webapp_keyboard(),
        parse_mode="HTML"
    )


@router.message(F.text == "📞 Support")
async def command_support_handler(message: Message) -> None:
    support_text = (
        "📞 <b>Mela Shop Support</b>\n\n"
        "Need assistance with an order or product inquiry?\n"
        "Contact our support team directly:\n"
        "• Telegram: @MelaShopSupport\n"
        "• Email: support@melashop.com"
    )
    await message.answer(text=support_text, parse_mode="HTML")


@router.callback_query(F.data == "help_info")
async def callback_help_info(callback: CallbackQuery) -> None:
    await callback.answer(text="Opening Help & Support info...")
    if callback.message:
        await callback.message.answer(
            text="ℹ️ Tap <b>🛍️ Open Mela Shop</b> below to start shopping!",
            reply_markup=get_shop_webapp_keyboard(),
            parse_mode="HTML"
        )

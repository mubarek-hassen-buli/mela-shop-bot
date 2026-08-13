import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from aiogram.types import BotCommand

from bot.config import settings
from bot.middlewares import LoggingMiddleware, AuthCheckMiddleware
from bot.handlers import routers_list

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("mela_bot")


async def set_bot_commands(bot: Bot) -> None:
    commands = [
        BotCommand(command="start", description="👋 Start bot & open shop"),
        BotCommand(command="shop", description="🛍️ Launch Mini App"),
        BotCommand(command="help", description="ℹ️ Usage instructions & support"),
    ]
    await bot.set_my_commands(commands)


async def main() -> None:
    logger.info("Starting Mela Shop Telegram Bot...")

    # Initialize bot with HTML parse mode
    bot = Bot(
        token=settings.TELEGRAM_BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )

    dp = Dispatcher()

    # Register Middlewares
    dp.update.outer_middleware(LoggingMiddleware())
    dp.update.outer_middleware(AuthCheckMiddleware())

    # Include Routers
    for router in routers_list:
        dp.include_router(router)

    # Set Bot Commands Menu
    await set_bot_commands(bot)

    # Delete existing webhooks before long polling
    await bot.delete_webhook(drop_pending_updates=True)

    logger.info("Bot successfully initialized and listening for updates...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot stopped successfully.")

import os
import asyncio
import logging
from aiohttp import web
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


async def handle_health(request: web.Request) -> web.Response:
    return web.Response(text="OK - Mela Telegram Bot Running", status=200)


async def start_web_server() -> None:
    """Lightweight HTTP server to satisfy Render Web Service port binding on free tier."""
    app = web.Application()
    app.router.add_get("/", handle_health)
    app.router.add_get("/health", handle_health)

    port = int(os.environ.get("PORT", 10000))
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    logger.info(f"Health check HTTP server listening on port {port}")


async def main() -> None:
    logger.info("Starting Mela Shop Telegram Bot...")

    # Start healthcheck server for Render port detection
    await start_web_server()

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

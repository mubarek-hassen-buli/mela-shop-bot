from aiogram import Router

from bot.handlers import start, help, shop

routers_list: list[Router] = [
    start.router,
    help.router,
    shop.router,
]

__all__ = ["routers_list"]

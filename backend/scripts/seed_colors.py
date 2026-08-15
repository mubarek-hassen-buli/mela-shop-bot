import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import select
from app.models.product_variant import Color

DEFAULT_COLORS = [
    {"name": "Black", "hex_code": "#000000"},
    {"name": "White", "hex_code": "#FFFFFF"},
    {"name": "Space Gray", "hex_code": "#4B4846"},
    {"name": "Silver", "hex_code": "#C0C0C0"},
    {"name": "Gold", "hex_code": "#FFD700"},
    {"name": "Rose Gold", "hex_code": "#B76E79"},
    {"name": "Midnight Blue", "hex_code": "#191970"},
    {"name": "Navy Blue", "hex_code": "#000080"},
    {"name": "Sky Blue", "hex_code": "#87CEEB"},
    {"name": "Forest Green", "hex_code": "#228B22"},
    {"name": "Olive", "hex_code": "#808000"},
    {"name": "Crimson Red", "hex_code": "#DC143C"},
    {"name": "Burgundy", "hex_code": "#800020"},
    {"name": "Purple", "hex_code": "#800080"},
    {"name": "Orange", "hex_code": "#FFA500"},
    {"name": "Yellow", "hex_code": "#FFFF00"},
    {"name": "Titanium", "hex_code": "#878681"},
]

async def seed_colors():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Color))
        existing = {c.name.lower(): c for c in res.scalars().all()}
        added = 0
        for col in DEFAULT_COLORS:
            if col["name"].lower() not in existing:
                db.add(Color(name=col["name"], hex_code=col["hex_code"]))
                added += 1
        if added > 0:
            await db.commit()
            print(f"Successfully seeded {added} default colors.")
        else:
            print(f"Colors already seeded ({len(existing)} colors found).")

if __name__ == "__main__":
    asyncio.run(seed_colors())

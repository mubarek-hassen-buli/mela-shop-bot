import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.admin import Admin
from app.core.security import hash_password


async def create_initial_admin():
    async with AsyncSessionLocal() as db:
        email = "admin@melashop.com"
        password = "adminpassword123"
        full_name = "Store Admin"

        stmt = select(Admin).where(Admin.email == email)
        res = await db.execute(stmt)
        existing_admin = res.scalar_one_or_none()

        if existing_admin:
            print(f"Admin already exists with email: {email}")
            return

        password_hash = hash_password(password)
        admin = Admin(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            role="admin",
            is_active=True
        )
        db.add(admin)
        await db.commit()
        print(f"Initial Admin created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")


if __name__ == "__main__":
    asyncio.run(create_initial_admin())

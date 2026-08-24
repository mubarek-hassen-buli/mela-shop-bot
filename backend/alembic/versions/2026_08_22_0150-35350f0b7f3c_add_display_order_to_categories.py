"""add_display_order_to_categories

Revision ID: 35350f0b7f3c
Revises: b7edcd444699
Create Date: 2026-08-22 01:50:22.388790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '35350f0b7f3c'
down_revision: Union[str, None] = 'b7edcd444699'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('categories', sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'))
    op.create_index('idx_categories_display_order', 'categories', ['display_order'])


def downgrade() -> None:
    op.drop_index('idx_categories_display_order', table_name='categories')
    op.drop_column('categories', 'display_order')

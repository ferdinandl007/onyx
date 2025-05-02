"""
add allowed_models to persona

Revision ID: aff3e12345ed
Revises: 4738e4b3bae1
Create Date: 2024-06-XX XX:XX:XX.XXXXXX
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'aff3e12345ed'
down_revision = '4738e4b3bae1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'persona',
        sa.Column(
            'allowed_models',
            postgresql.JSONB(),
            nullable=True,
        )
    )


def downgrade() -> None:
    op.drop_column('persona', 'allowed_models') 
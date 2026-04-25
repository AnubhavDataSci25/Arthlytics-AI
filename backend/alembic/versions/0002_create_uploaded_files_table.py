"""
CREATE uploaded_files TABLE

Revision ID: 0002
Revises: 0001
Create Date: 2026-01-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'uploaded_files',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('original_name', sa.String(), nullable=False),
        sa.Column('stored_name', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('file_size_kb', sa.Float(), nullable=False),
        sa.Column('row_count', sa.Integer(), nullable=True),
        sa.Column('col_count', sa.Integer(), nullable=True),
        sa.Column('columns', JSON, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'],['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_uploaded_files_id', 'uploaded_files', ['id'])
    op.create_index('ix_uploaded_files_user_id', 'uploaded_files', ['user_id'])

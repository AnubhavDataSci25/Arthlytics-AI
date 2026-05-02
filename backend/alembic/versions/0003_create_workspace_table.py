"""
    create workspace tables

    Revision ID: 0003
    Revise: 0002
    Create Date: 2026-01-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('invite_code', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['owner_id'],['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('invite_code'),
    )
    op.create_index('ix_projects_id', 'projects', ['id'])
    op.create_index('ix_projects_invite_code', 'projects', ['invite_code'], unique=True)

    op.create_table(
        'project_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(), server_default='Viewer'),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_project_members_id', 'project_members', ['id'])
    op.create_index('ix_project_members_project_id', 'project_members', ['project_id'])
    op.create_index('ix_project_members_user_id', 'project_members', ['user_id'])

    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('msg_type', sa.String(), server_default='chat'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_messages_id', 'messages', ['id'])
    op.create_index('ix_messages_project_id', 'messages', ['project_id'])

def downgrade() -> None:
    op.drop_index('ix_messages_project_id', 'messages')
    op.drop_index('ix_messages_id', 'messages')
    op.drop_index('messages')
    op.drop_index('ix_project_members_user_id', 'project_members')
    op.drop_index('ix_project_members_project_id', 'project_members')
    op.drop_index('ix_project_members_id', 'project_members')
    op.drop_index('project_members')
    op.drop_index('ix_projects_invite_code', 'projects')
    op.drop_index('ix_projects_id', 'projects')
    op.drop_table('projects')

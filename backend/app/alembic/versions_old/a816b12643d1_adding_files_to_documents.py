"""Adding files to documents

Revision ID: a816b12643d1
Revises: 56e2f2e2c3b3
Create Date: 2024-02-13 18:34:56.789012

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a816b12643d1'
down_revision = '56e2f2e2c3b3'
branch_labels = None
depends_on = None

def upgrade():
    # Alter the column to use VARCHAR type
    op.alter_column('classificationscheme', 'type',
               type_=sa.VARCHAR(),
               existing_type=sa.VARCHAR(),
               existing_nullable=True)

    # Remove the int_type column
    op.drop_column('classificationscheme', 'int_type')

def downgrade():
    # Add the int_type column back
    op.add_column('classificationscheme', sa.Column('int_type', sa.VARCHAR(), nullable=True))

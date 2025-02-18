"""Adding files to documents

Revision ID: dbc0dee84c4e
Revises: a816b12643d1
Create Date: 2025-02-13 05:13:42.359850

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'dbc0dee84c4e'
down_revision = 'a816b12643d1'
branch_labels = None
depends_on = None


def upgrade():
    # First, convert type to varchar temporarily if it isn't already
    op.execute('ALTER TABLE classificationscheme ALTER COLUMN type TYPE varchar USING type::varchar')
    
    # Drop existing enum if it exists
    op.execute('DROP TYPE IF EXISTS scheme_type')
    
    # Create the enum type
    op.execute("CREATE TYPE scheme_type AS ENUM ('int', 'str', 'list_dict')")
    
    # Now alter the column to use the new enum
    op.execute("ALTER TABLE classificationscheme ALTER COLUMN type TYPE scheme_type USING type::scheme_type")
    
    # Handle other column changes
    op.alter_column('classificationscheme', 'labels',
               existing_type=postgresql.ARRAY(sa.TEXT()),
               type_=sa.ARRAY(sa.String()),
               existing_nullable=True)
               
    op.drop_column('classificationscheme', 'int_type')


def downgrade():
    # Convert type back to varchar first
    op.execute('ALTER TABLE classificationscheme ALTER COLUMN type TYPE varchar USING type::varchar')
    
    # Add back the int_type column
    op.add_column('classificationscheme', sa.Column('int_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    
    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS scheme_type')
    
    op.alter_column('classificationscheme', 'labels',
               existing_type=sa.ARRAY(sa.String()),
               type_=postgresql.ARRAY(sa.TEXT()),
               existing_nullable=True)

"""Adding files to documents

Revision ID: 3795a9b9cedc
Revises: dbc0dee84c4e
Create Date: 2025-02-13 05:13:42.359850

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3795a9b9cedc'
down_revision = 'dbc0dee84c4e'
branch_labels = None
depends_on = None


def upgrade():
    # First convert any invalid values to valid ones
    op.execute("""
        UPDATE classificationscheme 
        SET type = 'str' 
        WHERE type NOT IN ('int', 'str', 'list_dict')
    """)
    
    # Then convert to varchar temporarily
    op.execute('ALTER TABLE classificationscheme ALTER COLUMN type TYPE varchar USING type::varchar')
    
    # Drop existing enum if it exists
    op.execute('DROP TYPE IF EXISTS scheme_type')
    
    # Create the enum type
    op.execute("CREATE TYPE scheme_type AS ENUM ('int', 'str', 'list_dict')")
    
    # Now alter the column to use the new enum
    op.execute("ALTER TABLE classificationscheme ALTER COLUMN type TYPE scheme_type USING type::scheme_type")


def downgrade():
    # Convert back to varchar
    op.execute('ALTER TABLE classificationscheme ALTER COLUMN type TYPE varchar USING type::varchar')
    
    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS scheme_type')

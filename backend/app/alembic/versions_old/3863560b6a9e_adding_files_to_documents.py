"""Adding files to documents

Revision ID: 3863560b6a9e
Revises: 3795a9b9cedc
Create Date: 2025-02-13 05:21:49.397244

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3863560b6a9e'
down_revision = '3795a9b9cedc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('classificationscheme', 'type',
               existing_type=postgresql.ENUM('int', 'str', 'list_dict', name='scheme_type'),
               nullable=True)
    op.alter_column('classificationscheme', 'labels',
               existing_type=postgresql.ARRAY(sa.TEXT()),
               type_=sa.ARRAY(sa.String()),
               existing_nullable=True)
    op.drop_column('classificationscheme', 'int_type')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('classificationscheme', sa.Column('int_type', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.alter_column('classificationscheme', 'labels',
               existing_type=sa.ARRAY(sa.String()),
               type_=postgresql.ARRAY(sa.TEXT()),
               existing_nullable=True)
    op.alter_column('classificationscheme', 'type',
               existing_type=postgresql.ENUM('int', 'str', 'list_dict', name='scheme_type'),
               nullable=False)
    # ### end Alembic commands ###

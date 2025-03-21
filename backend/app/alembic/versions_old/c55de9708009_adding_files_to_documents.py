"""Adding files to documents

Revision ID: c55de9708009
Revises: 7bfa717409e6
Create Date: 2025-02-13 02:38:18.416256

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'c55de9708009'
down_revision = '7bfa717409e6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('classificationresult', sa.Column('value', sa.JSON(), nullable=True))
    op.drop_column('classificationresult', 'score')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('classificationresult', sa.Column('score', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False))
    op.drop_column('classificationresult', 'value')
    # ### end Alembic commands ###

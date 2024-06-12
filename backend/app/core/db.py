from sqlmodel import Session, create_engine, select, SQLModel
from app import crud
from app.core.config import settings
from app.models import User, UserCreate

# Create the database engine
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))

def init_db(session: Session) -> None:
    # # Drop all tables if they exist and then recreate them
    # SQLModel.metadata.drop_all(engine)
    # SQLModel.metadata.create_all(engine)

    # # Check if the superuser exists
    # superuser = session.exec(
    #     select(User).where(User.email == settings.FIRST_SUPERUSER)
    # ).first()

    # # If the superuser doesn't exist, create one
    # if not superuser:
    #     superuser_data = UserCreate(
    #         email=settings.FIRST_SUPERUSER,
    #         password=settings.FIRST_SUPERUSER_PASSWORD,
    #         is_superuser=True,
    #     )
    #     crud.create_user(session=session, user_create=superuser_data)

    #     print("Superuser created.")
    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)

# Open a new session and initialize the database
with Session(engine) as session:
    init_db(session)
    session.commit()  # Commit transactions to make sure all changes are saved

print("Database initialization complete.")

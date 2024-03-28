FROM python:3.9

WORKDIR /app

# Copy the requirements.txt file
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# # Copy the core directory
# COPY ../utils ./core
# COPY ../configs ./configs

# Copy the main.py and other files from postgres_service
COPY ./main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "6969"]

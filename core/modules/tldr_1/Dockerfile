FROM python:3.9

WORKDIR /app

# Copy the requirements.txt file
COPY tldr_1/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the core directory
COPY core ./core

# Copy the main.py and other files from postgres_service
COPY tldr_1/main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "6969"]

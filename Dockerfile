# Use an official Python runtime as the base image
FROM python:3.11

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Create and set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy current directory code to the container
COPY . /app/

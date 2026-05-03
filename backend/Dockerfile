FROM alpine:latest

WORKDIR /app

# Install Python and build dependencies
RUN apk add --no-cache python3 py3-pip build-base python3-dev libffi-dev postgresql-dev

# Create a virtual environment and install dependencies inside it
# Modern Alpine requires --break-system-packages or a venv; venv is safer
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

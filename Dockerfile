FROM python:3.8-slim

WORKDIR /app

# Create user
RUN useradd -m appuser

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Give ownership to user
RUN chown -R appuser:appuser /app

USER appuser

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
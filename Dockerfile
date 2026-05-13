#stage1: Build Tailwind with Node
FROM node:24.13.1 AS frontend

WORKDIR /app

COPY frontend/package*.json ./frontend/

WORKDIR /app/frontend
RUN npm install

WORKDIR /app
COPY . .


WORKDIR /app/frontend
RUN npx @tailwindcss/cli -i ./src/input.css -o ../static/css/output.css --minify

#stage2: Django App
FROM python:3.8-slim

WORKDIR /app

# Create user
RUN useradd -m appuser

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure static/css directory exists
RUN mkdir -p /app/static/css

# Copy built CSS from Node stage
COPY --from=frontend /app/static/css/output.css /app/static/css/output.css

# Give ownership to user
RUN chown -R appuser:appuser /app
USER appuser


CMD ["gunicorn", "job_board.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
# CMD ["gunicorn", "job_board.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--log-level", "debug", "--access-logfile", "-", "--error-logfile", "-"]
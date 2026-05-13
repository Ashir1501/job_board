#stage1: Build Tailwind with Node
FROM node:24.13.1 AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npx @tailwindcss/cli -i ./src/input.css -o ../static/css/output.css --minify

#stage2: Django App
FROM python:3.8-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

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

RUN chmod +x start.sh

RUN python manage.py collectstatic --noinput

# Give ownership to user
RUN chown -R appuser:appuser /app
USER appuser

CMD ["./start.sh"]
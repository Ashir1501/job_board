#!/bin/sh

python manage.py migrate --noinput

celery -A job_board worker -l info --pool=solo &

exec gunicorn job_board.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 1 \
    --threads 2 \
    --worker-class gthread
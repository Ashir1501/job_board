

celery -A job_board worker -l info &

exec gunicorn job_board.wsgi:application --bind 0.0.0.0:$PORT --workers 4
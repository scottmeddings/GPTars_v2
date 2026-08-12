FROM python:3.12-slim

ARG SERVICE_NAME=tars-service
ENV SERVICE_NAME=${SERVICE_NAME} \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY software/services/runtime/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY software/services/runtime/app.py /app/app.py

EXPOSE 8000 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)"

CMD ["python", "/app/app.py"]

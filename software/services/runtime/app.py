import os
import socket
from datetime import datetime, timezone

from fastapi import FastAPI
import uvicorn

SERVICE_NAME = os.getenv("SERVICE_NAME", "tars-service")
APP_VERSION = os.getenv("APP_VERSION", "dev")

app = FastAPI(title=SERVICE_NAME)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "version": APP_VERSION,
        "host": socket.gethostname(),
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
def root():
    return {
        "service": SERVICE_NAME,
        "status": "scaffold",
        "message": "GP-TARS service container is running. Replace scaffold logic with the service implementation.",
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

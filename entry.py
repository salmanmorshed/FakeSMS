import os
import sys
import uvicorn
from backend.app import app

try:
    os.chdir(sys._MEIPASS)
except AttributeError:
    pass

if __name__ == "__main__":
    host = os.getenv("FAKESMS_HOST", "127.0.0.1")
    port = os.getenv("FAKESMS_PORT", "8104")
    uvicorn.run(app, host=host, port=int(port))

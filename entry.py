import os
import sys
import uvicorn
from backend.app import app

try:
    os.chdir(sys._MEIPASS)
except AttributeError:
    pass

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8104)

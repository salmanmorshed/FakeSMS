setup-backend:
	python -m venv venv
	. venv/bin/activate
	python -m pip install -U pip pip-tools
	pip-sync

setup-frontend:
	npm install
	npm run build

package:
	pyinstaller \
	    -y --clean \
	    --name FakeSMS \
	    --paths venv/lib/python3.11/site-packages \
	    --hidden-import=tortoise.backends.sqlite \
	    --add-data="/home/salman/Projects/lawtracer/FakeSMS/build/frontend/index.html:./build/frontend" \
	    --onefile \
	    entry.py

build: setup-backend setup-frontend package

.phony: setup-backend setup-frontend package build

setup-backend:
	python -m venv venv
	./venv/bin/pip install -U pip pip-tools
	./venv/bin/pip-sync

setup-frontend:
	npm install
	npm run build

package:
	./venv/bin/pyinstaller \
	    -y --clean \
	    --name FakeSMS \
	    --paths venv/lib/python3.11/site-packages \
	    --hidden-import=tortoise.backends.sqlite \
	    --add-data="./build/frontend/index.html:./build/frontend" \
	    --onefile \
	    entry.py

build: setup-backend setup-frontend package

.phony: setup-backend setup-frontend package build

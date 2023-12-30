import os

import appdirs
import tomlkit
from typing import TypedDict

USER_DATA_PATH = appdirs.user_data_dir("FakeSMS")
CONFIG_FILE = os.path.join(USER_DATA_PATH, "config.toml")
DATABASE_FILE = os.path.join(USER_DATA_PATH, "db.sqlite3")


class ConfigDict(TypedDict):
    webhook_url: str
    registered_numbers: list[str]


def load_config() -> ConfigDict:
    if not os.path.exists(CONFIG_FILE):
        save_config(ConfigDict(webhook_url="", registered_numbers=[]))

    with open(CONFIG_FILE, "r") as fp:
        conf = tomlkit.load(fp)
        return conf["app"]


def save_config(data: ConfigDict):
    doc = tomlkit.document()
    app = tomlkit.table()
    app.add("webhook_url", data["webhook_url"])
    app.add("registered_numbers", data["registered_numbers"])
    doc.add("app", app)

    if not os.path.exists(USER_DATA_PATH):
        os.mkdir(USER_DATA_PATH)

    with open(CONFIG_FILE, "w") as fp:
        tomlkit.dump(doc, fp)


def get_tortoise_config() -> dict[str, any]:
    return {
        "connections": {
            "default": f"sqlite://{DATABASE_FILE}",
        },
        "apps": {
            "models": {
                "models": ["backend.models"],
                "default_connection": "default",
            }
        },
    }

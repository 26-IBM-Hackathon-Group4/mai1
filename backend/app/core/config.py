import os
import json
from pydantic_settings import BaseSettings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SECRET_FILE_PATH = os.path.join(BASE_DIR, "secret_db.json")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mai1 Security Service"
    
    DB_USER: str = ""
    DB_PASSWORD: str = ""
    DB_HOST: str = ""
    DB_PORT: str = ""
    DB_NAME: str = ""
    DATABASE_URL: str = ""

    def __init__(self):
        super().__init__()
        self._load_secrets()

    def _load_secrets(self):
        try:
            with open(SECRET_FILE_PATH, "r", encoding="utf-8") as f:
                secrets = json.load(f)
                
                self.DB_USER = secrets.get("DB_USER", "root")
                self.DB_PASSWORD = secrets.get("DB_PASSWORD", "")
                self.DB_HOST = secrets.get("DB_HOST", "localhost")
                self.DB_PORT = secrets.get("DB_PORT", "3306")
                self.DB_NAME = secrets.get("DB_NAME", "mai1")

                self.DATABASE_URL = f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
                
        except FileNotFoundError:
            print(f"❌ 오류: 설정 파일({SECRET_FILE_PATH})을 찾을 수 없습니다.")
        except json.JSONDecodeError:
            print(f"❌ 오류: 설정 파일({SECRET_FILE_PATH})의 JSON 형식이 잘못되었습니다.")

settings = Settings()
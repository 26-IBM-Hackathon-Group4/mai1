# config_loader.py
import json

class Config:
    def __init__(self, path="config.json"):
        with open(path, "r", encoding="utf-8") as f:
            self.raw = json.load(f)

        self.api_key = self.raw["ibm"]["api_key"]
        self.service_url = self.raw["ibm"]["service_url"]
        self.classifier_agent = self.raw["ibm"]["agents"]["classifier"]
        self.privacy_agent = self.raw["ibm"]["agents"]["privacy"]
        self.checklist_titles = self.raw["checklist_titles"]

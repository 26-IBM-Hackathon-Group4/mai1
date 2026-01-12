from fastapi import FastAPI, UploadFile
import requests, json, time, pandas as pd
from config_loader import Config

app = FastAPI()
config = Config("config.json")

_token_cache = {"token": None, "expire": 0}

def get_token():
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expire"] - 60:
        return _token_cache["token"]

    res = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={"Content-Type":"application/x-www-form-urlencoded"},
        data={
            "grant_type":"urn:ibm:params:oauth:grant-type:apikey",
            "apikey": config.api_key
        }
    ).json()

    _token_cache["token"] = res["access_token"]
    _token_cache["expire"] = now + res["expires_in"]
    return _token_cache["token"]

@app.post("/classify")
def classify(input_data: dict):
    res = requests.post(
        f"{config.service_url}/v1/orchestrate/{config.classifier_agent}/chat/completions",
        headers={
            "Authorization": f"Bearer {get_token()}",
            "Content-Type": "application/json"
        },
        json={"messages":[{"role":"user","content":json.dumps(input_data,ensure_ascii=False)}]}
    ).json()

    parsed = json.loads(res["choices"][0]["message"]["content"])
    return [x["sender"].split("@")[1].split(".")[0] for x in parsed["results"] if x["signup"]=="Y"]

@app.post("/privacy")
async def evaluate(file: UploadFile, name: str):
    text = (await file.read()).decode("utf-8")

    res = requests.post(
        f"{config.service_url}/v1/orchestrate/{config.privacy_agent}/chat/completions",
        headers={
            "Authorization": f"Bearer {get_token()}",
            "Content-Type":"application/json"
        },
        json={"messages":[{"role":"user","content":text}]}
    ).json()

    data = json.loads(res["choices"][0]["message"]["content"])

    rows=[]
    for k,v in data.items():
        rows.append({"항목":k,"P/F":v["result"],"evidence":v["evidence"],"reason":v["reason"]})

    df = pd.DataFrame(rows).set_index("항목")
    df["항목 이름"] = config.checklist_titles[:len(df)]
    df["P/F"] = df["P/F"].replace({"PASS":1,"FAIL":0,"N/A":0.5}).astype(float)

    return {"name":name,"score":df["P/F"].mean(),"missing":",".join(df[df["P/F"]==0]["항목 이름"])}


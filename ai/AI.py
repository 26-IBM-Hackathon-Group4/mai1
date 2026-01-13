import requests
import json
import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SECRET_PATH = os.path.join(BASE_DIR, '../backend/secret_ibm.json')

try:
    with open(SECRET_PATH, 'r', encoding='utf-8') as f:
        secrets = json.load(f)
except FileNotFoundError:
    print(f"Error: {SECRET_PATH} not found.")
    secrets = {}

API_KEY = secrets.get("API_KEY", "")
SERVICE_URL = secrets.get("SERVICE_URL", "")
classifier_AGENT_ID = secrets.get("classifier_AGENT_ID", "")
Privacy_AGENT_ID = secrets.get("Privacy_AGENT_ID", "")
CHECKLIST_TITLES = secrets.get("CHECKLIST_TITLES", [])

def classifier(input_data):

    # IAM 토큰 발급
    token = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": API_KEY.strip()
        },
    ).json()["access_token"]

    # Watson Orchestrate 호출
    res = requests.post(
        f"{SERVICE_URL.rstrip('/')}/v1/orchestrate/{classifier_AGENT_ID}/chat/completions",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        json={
            "messages": [
                {"role": "user", "content": json.dumps(input_data, ensure_ascii=False)}
            ],
            "stream": False
        },
    ).json()

    content = res["choices"][0]["message"]["content"]
    return content



def call_classifier(input_data):
    content = classifier(input_data)

    # content가 문자열이면 dict로 변환
    if isinstance(content, str):
        content = json.loads(content)

    # signup이 'Y'인 sender에서 @ 뒤부터, 그리고 첫 번째 '.' 앞까지만 추출
    domains = [item["sender"].split("@")[1].split(".")[0] 
               for item in content["results"] if item["signup"] == "Y"]

    return domains


def analyze_privacy(path,name):

    # 3️⃣ IAM 토큰 발급
    token = requests.post(
        "https://iam.cloud.ibm.com/identity/token",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        },
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": API_KEY.strip()
        },
    ).json()["access_token"]

    # 4️⃣ 텍스트 파일 읽기
    with open(path, "r", encoding="utf-8") as f:
        privacy_text = f.read()

    # 5️⃣ Watson Orchestrate 호출
    res = requests.post(
        f"{SERVICE_URL.rstrip('/')}/v1/orchestrate/{Privacy_AGENT_ID}/chat/completions",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        json={
            "messages": [{"role": "user", "content": privacy_text}],
            "stream": False
        },
    ).json()

    # 6️⃣ LLM 응답 content
    content = res["choices"][0]["message"]["content"]

    # 8️⃣ JSON 파싱
    try:
        parsed = json.loads(content)
        return {
            "status": "success",
            "data": parsed
        }
    except json.JSONDecodeError:
        return {
            "status": "error",
            "raw": content
        }



def call_privacy_evaluate(path, name):
    result = analyze_privacy(path,name)

    if "data" in result:
        data = result["data"]
    else:
        data = result
    rows = []
    for key, value in data.items():
        rows.append({
            "항목": key,                
            "P/F": value["result"],  
            "evidence": value["evidence"],
            "reason": value['reason']
        })

    df = pd.DataFrame(rows).set_index("항목")

    df['항목 이름'] = CHECKLIST_TITLES

    df['P/F'] = df['P/F'].replace({"PASS": 1, "FAIL": 0, "N/A": 0.5}).astype(float)


    fail_items = df[df['P/F'] == 0]['항목 이름']
    fail_statement = ", ".join(fail_items) + " 이(가) 누락되어 있습니다." if not fail_items.empty else ""


    na_items = df[df['P/F'] == 0.5]['항목 이름']
    na_statement = ", ".join(na_items) + " 이(가) 명확히 명시되어 있지 않습니다." if not na_items.empty else ""


    final_statement = " ".join(filter(None, [fail_statement, na_statement]))

    return {
        "name": name,
        "score": df['P/F'].mean(),
        "missing": final_statement
    }
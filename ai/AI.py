import requests
import json
import os
from dotenv import load_dotenv
import pandas as pd

# 1️⃣ .env 파일 불러오기 (프로세스 전체에서 사용 가능)
load_dotenv()

def classifier(input_data):

    API_KEY = os.getenv("API_KEY")
    SERVICE_URL = os.getenv("SERVICE_URL")
    AGENT_ID = os.getenv("Classifier_AGENT_ID")

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
        f"{SERVICE_URL.rstrip('/')}/v1/orchestrate/{AGENT_ID}/chat/completions",
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
    

    # 2️⃣ 환경변수 불러오기
    API_KEY = os.getenv("API_KEY")
    SERVICE_URL = os.getenv("SERVICE_URL")
    AGENT_ID = os.getenv("Privacy_AGENT_ID")

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
        f"{SERVICE_URL.rstrip('/')}/v1/orchestrate/{AGENT_ID}/chat/completions",
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


    checklist_env = os.getenv("CHECKLIST_TITLES", "")
    checklist_titles = [x.strip() for x in checklist_env.split(",") if x.strip()]


    df['항목 이름'] = checklist_titles

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

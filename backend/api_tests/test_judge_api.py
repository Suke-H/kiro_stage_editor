#!/usr/bin/env python
"""
judge APIをテストするためのスクリプト
uvicornで別途サーバーが起動していることを前提とする
"""

import requests
import json

# サンプルグリッドデータ（Start と Goal を含む簡単なケース）
sample_grid = [
    [
        {"side": "neutral", "type": "Start"},
        {"side": "neutral", "type": "Normal"},
        {"side": "neutral", "type": "Goal"}
    ],
    [
        {"side": "neutral", "type": "Normal"},
        {"side": "neutral", "type": "Normal"},
        {"side": "neutral", "type": "Normal"}
    ]
]

def test_judge_api():
    """judge APIをテストする"""
    url = "http://localhost:8000/api/judge"
    
    try:
        response = requests.post(url, json=sample_grid)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"Error: {response.text}")
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    error_detail = response.json()
                    print(f"Error Detail: {json.dumps(error_detail, indent=2, ensure_ascii=False)}")
                except:
                    pass
            
    except requests.exceptions.ConnectionError:
        print("Error: サーバーに接続できません。uvicornサーバーが起動していることを確認してください。")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("judge APIをテストします...")
    print(f"送信するグリッドデータ: {json.dumps(sample_grid, indent=2, ensure_ascii=False)}")
    print()
    test_judge_api()
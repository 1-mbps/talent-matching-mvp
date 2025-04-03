import json
from uuid import uuid4

with open("testing/test_collection.json", "r") as f:
    data = json.load(f)

resumes = {}

for job in data:
    for resume in job["resumes"]:
        if resume["name"] not in resumes:
            resumes[resume["name"]] = str(uuid4())
        resume["id"] = resumes[resume["name"]]

with open("clean_test_collection.json", "w") as f:
    json.dump(data, f, indent=4)
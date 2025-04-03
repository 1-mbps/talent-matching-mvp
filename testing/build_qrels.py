import json

with open("testing/clean_test_collection.json", "r") as f:
    data = json.load(f)

qrels = {}

for job in data:
    qrel = {}
    for resume in job["resumes"]:
        qrel[resume["id"]] = resume["rating"]
    qrels[job["category"]] = qrel

with open("testing/qrels.json", "w") as f:
    json.dump(qrels, f, indent=4)
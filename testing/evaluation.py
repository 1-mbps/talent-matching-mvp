import json
import threading
from ranx import Qrels, Run, evaluate

from testing.matching import get_matches

# Retrieve matches, and compile scores into a dictionary
def get_match_scores(job_desc: str, category: str, run_dict: dict):
    matches = get_matches(job_desc)
    for match in matches:
        score = match["score"]
        run_dict[category][match["id"]] = score

with open("testing/clean_test_collection.json", "r") as f:
    test_collection = json.load(f)

# Dictionary of user-defined gain scores for each resume in each job
qrels_dict = {}

# Dictionary of match scores for each resume in each job
# This will be compared with the gain scores to calculate NDCG
run_dict = {}
threads = []

for job in test_collection:
    # Build qrels dictionary
    category_dict = {}
    for resume in job["resumes"]:
        category_dict[resume["id"]] = resume["rating"]
    qrels_dict[job["category"]] = category_dict
    run_dict[job["category"]] = {}

    # Get match scores
    thread = threading.Thread(target=get_match_scores, args=(job["job_description"], job["category"], run_dict))
    thread.start()
    threads.append(thread)


for thread in threads:
    thread.join()

# We need to create both objects, and then we can evaluate the run against the qrels
qrels = Qrels(qrels_dict)
run = Run(run_dict)

print("Evaluating...")
evaluate(qrels, run, metrics=["ndcg@5", "mrr"])

result = dict(run.scores)
json.dump(result, open("testing/evaluation_results.json", "w"), indent=4)
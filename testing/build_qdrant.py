from qdrant_client import QdrantClient, models
from qdrant_client.models import PointStruct, VectorStruct
import json
from utils.env import env
from utils.embedding import build_qdrant_vector

vector_client = QdrantClient(url=env["QDRANT_URL"], api_key=env["QDRANT_API_KEY"])

with open("testing/clean_test_collection.json", "r") as f:
    data = json.load(f)

points = {}

for job in data:
    gain_cat = f"{job["category"]}_gain"
    for resume in job["resumes"]:
        id = resume["id"]
        if id not in points:
            # Add gain category to Qdrant payload
            resume[gain_cat] = resume["rating"]
            # Create Qdrant vector consisting of BM42 (sparse) and Jina (dense) embeddings
            vec = build_qdrant_vector(resume["resume"])
            point = {"vector": vec, "payload": resume}
            points[id] = point
        else:
            points[id]["payload"][gain_cat] = resume["rating"]

points_list = [PointStruct(id=id, **point) for id, point in points.items()]
            
vector_client.upsert(collection_name="talent-pool", points=points_list)
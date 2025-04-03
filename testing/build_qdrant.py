from qdrant_client import QdrantClient, models
from qdrant_client.models import PointStruct, VectorStruct
import json
from utils.env import env
from fastembed import SparseTextEmbedding, TextEmbedding

vector_client = QdrantClient(url=env["QDRANT_URL"], api_key=env["QDRANT_API_KEY"])
model_bm42 = SparseTextEmbedding(model_name="Qdrant/bm42-all-minilm-l6-v2-attentions")
model_jina = TextEmbedding(model_name="jinaai/jina-embeddings-v2-base-en")

with open("testing/clean_test_collection.json", "r") as f:
    data = json.load(f)

def bm42_embed(text: str) -> list[float]:
    embeddings = list(model_bm42.query_embed(text))[0]
    if hasattr(embeddings, 'indices') and hasattr(embeddings, 'values'):
        sparse_vector = models.SparseVector(
            indices=embeddings.indices.tolist(),
            values=embeddings.values.tolist()
        )
        return sparse_vector
    else:
        raise ValueError("The embeddings object does not have 'indices' and 'values' attributes.")

def jina_embed(text: str) -> list[float]:
    return list(model_jina.query_embed(text))[0].tolist()

points = {}

for job in data:
    gain_cat = f"{job["category"]}_gain"
    for resume in job["resumes"]:
        id = resume["id"]
        if id not in points:
            bm42_vec = bm42_embed(resume["resume"])
            jina_vec = jina_embed(resume["resume"])
            resume[gain_cat] = resume["rating"]
            point = {"vector": {"bm42": bm42_vec, "jina": jina_vec}, "payload": resume}
            points[id] = point
        else:
            points[id]["payload"][gain_cat] = resume["rating"]

points_list = [PointStruct(id=id, **point) for id, point in points.items()]
            
vector_client.upsert(collection_name="talent-pool", points=points_list)
    # vector_client.upsert(
    #     collection_name=job["category"],
    #     points=[
    #         PointStruct(
    #             id=str(uuid4()), vector = resume["vector"], payload = {"category": job["category"]}
    #         ) for i in range(len(vectors))
    #     ]
    # )

# vector_client.upsert(
#     collection_name=self.collection_name,
#     points=[
#         PointStruct(
#             id=str(uuid4()), vector = vectors[i], payload = {"category": categories[i]}
#         ) for i in range(len(vectors))
#     ]
# )
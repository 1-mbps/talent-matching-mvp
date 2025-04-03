from qdrant_client import QdrantClient, models
from utils.env import env

vector_client = QdrantClient(url=env["QDRANT_URL"], api_key=env["QDRANT_API_KEY"])

vector_client.create_collection(
    collection_name="talent-pool",
    vectors_config={
        "jina": models.VectorParams(
            size=768,
            distance=models.Distance.COSINE,
        )
    },
    sparse_vectors_config={
        "bm42": models.SparseVectorParams(
            modifier=models.Modifier.IDF,
        )
    }
)
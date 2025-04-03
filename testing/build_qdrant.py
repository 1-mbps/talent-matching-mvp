# from qdrant_client import QdrantClient, models
# from qdrant_client.models import PointStruct
# from uuid import uuid4
# import json

# vector_client = QdrantClient(url="http://localhost:6333")

# with open("test_collection.json", "r") as f:


# vector_client.upsert(
#     collection_name=self.collection_name,
#     points=[
#         PointStruct(
#             id=str(uuid4()), vector = vectors[i], payload = {"category": categories[i]}
#         ) for i in range(len(vectors))
#     ]
# )
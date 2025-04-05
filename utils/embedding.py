from fastembed import SparseTextEmbedding, TextEmbedding
from qdrant_client.models import SparseVector
model_bm42 = SparseTextEmbedding(model_name="Qdrant/bm42-all-minilm-l6-v2-attentions")
model_jina = TextEmbedding(model_name="jinaai/jina-embeddings-v2-base-en")

def bm42_embed(text: str) -> list[float]:
    embeddings = list(model_bm42.query_embed(text))[0]
    if hasattr(embeddings, 'indices') and hasattr(embeddings, 'values'):
        sparse_vector = SparseVector(
            indices=embeddings.indices.tolist(),
            values=embeddings.values.tolist()
        )
        return sparse_vector
    else:
        raise ValueError("The embeddings object does not have 'indices' and 'values' attributes.")

def jina_embed(text: str) -> list[float]:
    return list(model_jina.query_embed(text))[0].tolist()

def build_qdrant_vector(text: str) -> dict:
    bm42_vec = bm42_embed(text)
    jina_vec = jina_embed(text)
    return {"bm42": bm42_vec, "jina": jina_vec}
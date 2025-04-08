from qdrant_client import QdrantClient, models
import threading
import json

from utils.env import env
from utils.agents import ResumeRater
from utils.embedding import bm42_embed, jina_embed

client = QdrantClient(url=env["QDRANT_URL"], api_key=env["QDRANT_API_KEY"])
N_THREADS = 2

def calculate_resume_matches(rating_schema: dict, schema_weights: dict[str, float], collection_name: str = "talent-pool") -> list[dict]:

    schema_keys = list(rating_schema["properties"].keys())

    # Compute two embeddings for the rating categories:
    # BM42: good balance of keyword matching and semantic meaning
    # Jina: good at semantic meaning, but not as good at keyword matching
    sparse_embedding = bm42_embed(str(schema_keys))
    dense_embedding = jina_embed(str(schema_keys))

    # Query from talent pool
    # Taken from https://qdrant.tech/articles/bm42/
    results = client.query_points(
        collection_name=collection_name,
        prefetch=[
            models.Prefetch(query=sparse_embedding, using="bm42", limit=10),
            models.Prefetch(query=dense_embedding,  using="jina", limit=10),
        ],
        # Use reciprocal rank fusion to combine the similarity scores of the BM42 and Jina embeddings
        query=models.FusionQuery(fusion=models.Fusion.RRF),
        limit=10
    )

    # Extract the payload and id from the results
    resume_list = [result.payload | {"id": result.id} for result in results.points]
    ratings_list = []

    # Initialize the LLM resume rater - rates resumes based on the rating schema
    resume_rater = ResumeRater(rating_schema)

    # Process the resumes in parallel
    chunk_size = len(resume_list) // N_THREADS

    # Create and start threads
    threads = []
    for i in range(N_THREADS):
        start_index = i * chunk_size
        end_index = start_index + chunk_size if i < N_THREADS - 1 else None
        chunk = resume_list[start_index:end_index]
        
        thread = threading.Thread(target=process_chunk, args=(chunk,resume_rater,ratings_list))
        thread.start()
        threads.append(thread)
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()

    # Calculate the score for each candidate by multiplying the ratings by the weights
    # provided by the prospective employer, and summing the results
    for candidate in ratings_list:
        candidate["score"] = sum([candidate["ratings"][key] * schema_weights[key] for key in candidate["ratings"].keys()])

    return ratings_list

def process_chunk(chunk, resume_rater: ResumeRater, ratings_list: list) -> None:
    for resume_dict in chunk:
        ratings = resume_rater.respond(resume_dict["resume"])
        resume_dict["ratings"] = json.loads(ratings)
        ratings_list.append(resume_dict)
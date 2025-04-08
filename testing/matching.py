import json

from utils.agents import SchemaMakerAgent
from utils.matching import calculate_resume_matches

schema_maker = SchemaMakerAgent()

def get_matches(job_desc: str):
    schema = schema_maker.respond(job_desc)
    json_schema = json.loads(schema)

    schema_weights = {key: 1.0 for key in json_schema["properties"].keys()}

    matches = calculate_resume_matches(json_schema, schema_weights, collection_name="talent-pool-test-collection")

    return matches


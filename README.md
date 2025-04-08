# talent-matching-mvp
Submission for Brave 10x AI Engineer Hackathon

This is a talent matching site that matches businesses and hiring managers with prospective candidates using AI.

## Setup

Prerequisites: Python 3.10+, Node (npm)

### Backend setup

1. Create a Python virtual environment
2. Run `pip install -r requirements.txt`

### Frontend setup
1. Go to the nested frontend folder - `cd talent-matching-mvp`
2. Run `npm install`

## Running this codebase

Running the backend requires API key access to Qdrant, Supabase, and OpenAI. For obvious reasons, I won't make my API keys public, but if you _really_ want to run this codebase, contact me (lucaskhan03@gmail.com / LinkedIn on my profile)

1. Run the backend: `fastapi dev main.py`
2. Run the frontend: go to the `talent-matching-mvp` folder and run `npm start`

## Matching algorithm

The matching algorithm has two main steps:
a. Retrieval
b. Ranking

This is an overview of each:

### (a) Retrieval
1. Each resume is converted into two types of embeddings: BM42 and Jina. [BM42](https://qdrant.tech/articles/bm42/) is an experimental embedding function that includes aspects of both BM25 - a classical retrieval function that's good at keyword matching - and regular transformer-based embedding functions. Jina is a regular 768-dimensional transformer-based embedding function. Since BM25 is good at keyword matching (which is helpful when ranking resumes), and embeddings are good at capturing semantic meaning, using a combination of both is highly effective at screening resumes for both specific keywords *and* semantic intent.

2. The job description is also converted into those two embedding types.

3. Compute the cosine similarity of each resume embedding to its corresponding embedding on the job description. Then, combine the two scores using reciprocal-rank fusion.

4. Return the 7 highest-scoring resumes.

### (b) Ranking

After narrowing down our talent pool, we will use LLMs to rate each resume for an even more accurate ranking. However, this first requires a *rating schema*.

#### Rating schema

When the user creates a job, the site uses OpenAI's structured outputs to generate a rating schema based on the job description.

This is an (abridged) rating system for a machine learning engineer posting:
```
"statistical_modeling": {
    "type": "integer",
    "description": "Rate the candidate's understanding of statistical modeling concepts on a scale of 1 to 10."
},
"machine_learning_algorithms": {
    "type": "integer",
    "description": "Rate the candidate's experience with machine learning algorithms on a scale of 1 to 10."
}
...
```
The matching system will later use an LLM to rate resumes using this rating system.

Once this has been generated, the user can edit the rating system and also assign *weights* to each category, like so:
```
{
    "statistical_modeling": 0.7,
    "machine_learning_algorithms": 1.0
}
this allows the user to precisely define the importance of each skill.
```

Once these are in place, the site uses an LLM to rate each resume using that rating system. This produces a dictionary of ratings like this:
```
{
    "statistical_modeling": 6,
    "machine_learning_algorithms": 8
    ...
}
```
these ratings are then multiplied by the category weights provided by the user, and then summed (essentially a dot product of the two vectors) to produce a final score for the resume.

## Evaluation
In `testing/clean_test_collection.json`, you can see the test collection I used to test my matching system.

The test collection includes 4 job descriptions: for a civil engineer, mechanical engineer, software engineer, and machine learning engineer (MLE). It also includes 20 resumes, each of which has been assigned a "gain" score ("rating" on the JSON) indicating its suitability for each category. For example, the resume that's most suited to the MLE position has a "rating" of 5.

This collection was used to evaluate the NDCG@5 (normalized discounted cumulative gain) and mean reciprocal rank for each category.

You can find these at `testing/evaluation_results.json`:
```
{
    "ndcg@5": {
        "civil": 0.8005029517048845,
        "mech": 0.8582372575736656,
        "mle": 0.8461430470460428,
        "software": 0.7643508363298691
    },
    "mrr": {
        "civil": 1.0,
        "mech": 1.0,
        "mle": 1.0,
        "software": 1.0
    }
}
```
The NDCG scores (max. 1) indicate that the ranking algorithm did a very good job of getting the right resumes in the right order.

Note that these scores were computed WITHOUT having a human manually edit the rating schema or change the weights (these were all set to 1); these changes would likely improve the accuracy of the recommendation system.


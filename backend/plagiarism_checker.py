from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def plagiarism_check(text: str, references: list = []):
    if not references:
        return {
            "plagiarism_percent": 0,
            "originality_percent": 100,
            "verdict": "No references available – assumed original"
        }

    corpus = [text] + references
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf = vectorizer.fit_transform(corpus)

    scores = cosine_similarity(tfidf[0:1], tfidf[1:])
    max_score = scores.max()

    percent = round(max_score * 100, 2)

    verdict = (
        "High plagiarism risk"
        if percent > 30
        else "Low plagiarism risk"
    )

    return {
        "plagiarism_percent": percent,
        "originality_percent": round(100 - percent, 2),
        "verdict": verdict
    }

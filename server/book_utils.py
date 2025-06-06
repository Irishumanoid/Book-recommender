import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from Levenshtein import jaro

def load_df():
    return pd.read_csv('books_out.csv')

def recommend(books_df: pd.DataFrame, cos_sim: np.ndarray, title: str, top_n=10):
    indices = pd.Series(books_df['name'])
    titles = indices.values
    if title not in titles:
        # get most similar title
        jaro_scores = {}
        for t in titles:
            jaro_scores[t] = jaro(title, t)
        most_similar = [key for key, value in jaro_scores.items() if value == max(jaro_scores.values())]
        title = most_similar[0]
        print(f'title {title} with score {jaro_scores[title]}')
    recs = {}
    index = indices[indices == title].index[0]
    scores = pd.Series(cos_sim[index]).sort_values(ascending=False)
    top_n_indices = list(scores.iloc[1:top_n+1].index)

    for i in top_n_indices:
        recs[list(books_df['name'])[i]] = float(round(scores.iloc[i], 2))
    return recs

# TODO implement similarity search if book title is  slightly off
def recommend_book(book_title: str, n_books: int):
    books_df = load_df()
    tf = TfidfVectorizer(analyzer = "word", ngram_range = (1,2), min_df = 0.1, stop_words = 'english')
    tfidf_matrix = tf.fit_transform(books_df['book info'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return recommend(books_df, cosine_sim, book_title, n_books)

recommend_book('harry potter', 5)
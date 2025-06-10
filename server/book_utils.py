import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
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

    book_index = books_df[books_df['name'] == title].index[0]
    target_cluster = books_df.loc[book_index, 'cluster']
    same_cluster_indices = books_df[books_df['cluster'] == target_cluster].index.tolist()

    sim_scores = pd.Series(cos_sim[book_index])
    sim_scores = sim_scores.loc[same_cluster_indices]
    sim_scores = sim_scores.drop(index=book_index, errors='ignore')
    sim_scores = sim_scores.sort_values(ascending=False)
    top_n_indices = sim_scores.iloc[:top_n].index

    recs = {}
    for i in top_n_indices:
        recs[books_df.loc[i, 'name']] = float(round(sim_scores[i], 2))
    return recs, title if title else ''


def recommend_book(book_title: str, n_books: int):
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    return recommend(results, cosine_sim, book_title, n_books)


books_df = load_df()
tf = TfidfVectorizer(analyzer = "word", ngram_range = (1,2), min_df = 0.1, stop_words = 'english')
tfidf_matrix = tf.fit_transform(books_df['book info'])
k_means = KMeans(n_clusters=10, n_init=5, max_iter=1000)
k_means.fit(tfidf_matrix)
results = pd.DataFrame()
results['cluster'] = k_means.labels_
results = pd.concat([books_df, results], axis=1)
#print(results.sample(5))
#print(recommend_book('The Hunger Games', n_books=1))
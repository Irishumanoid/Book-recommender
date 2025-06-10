import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from book_utils import recommend_book, load_df

app = Flask(__name__)
CORS(app)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    title = data.get('title')
    n_books = data.get('num_books')
    if not title:
        return jsonify({'error': 'title not found'}), 400
    
    results = recommend_book(title, n_books)
    recs = dict(results[0])
    closest_title = results[1]
    if closest_title != '':
        return jsonify({'results': recs, 'closest': closest_title})
    else:
        return jsonify({'results': recs})

@app.route('/api/get_books', methods=['POST'])
def get_books():
    books = load_df()
    return jsonify({'data': books.to_csv()})
    

if __name__ == '__main__':
    '''port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)'''
    app.run(debug=True)
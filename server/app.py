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
    return jsonify({'results': results})

@app.route('/api/get_books', methods=['POST'])
def get_books():
    books = load_df()
    return jsonify({'data': books.to_csv()})
    

if __name__ == '__main__':
    app.run(debug=True)
import { useEffect, useState } from "react";
import Papa from 'papaparse';
import { Button, TextField, Stack } from "@mui/material";

interface BookData {
  id: number,
  name: string,
  bookInfo: string,
}

const createBookData = (id: number, name: string, bookInfo: string): BookData => {
  return { id, name, bookInfo };
}

const loadCSV = (csvUrl: string): Promise<any[]> => {
    return fetch(csvUrl)
        .then(response => response.text())
        .then(responseText => {
            const results = Papa.parse(responseText, { header: true }).data;
            return results;
        })
        .catch(error => {
            console.error('Error loading CSV:', error);
            return [];
        });
};

const PythonRunner = () => {
  const [books, setBooks] = useState<BookData[] | null>(null); // TODO display as dropdown directory
  const [recs, setRecs] = useState<String[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      fetch('http://127.0.0.1:5000/api/get_books', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('failed to fetch books');
        }
        return response.json();
      })
      .then(data => {
        const csv = data['data'];
        const parsed = Papa.parse(csv, {header: true});
        const results = parsed.data
          .map((row: any) => createBookData(row['id'], row['name'], row['book_info']));
        setBooks(results);
      });

      await fetch('http://127.0.0.1:5000/api/recommend', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({'title': 'The Hunger Games'})
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('failed response for book recommendations');
          }
          return response.json();
          })
        .then(data => console.log(data))
        .catch(error => console.error('there was an error retrieving the response', error));
      };
    loadData();
  }, []);


  const fetchRecs = async (bookName: string) => {
    console.log(`query is ${bookName}`)
    try {
      const response = await fetch('http://127.0.0.1:5000/api/recommend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'title': bookName})
      })
      console.log('response: ', response);

      if (!response.ok) {
        throw new Error('failed response for book recommendations');
      }
      const data = await response.json();
      const recs = data['results'];
      console.log('data is: ', recs);
      setRecs(recs);
    } catch (error) {
      console.error('there was an error retrieving the response', error)
    }
  }

  return (
    <div>
      <h1>Get all your spicy book recs</h1>
      <Stack direction='row' justifyContent='center'>
        <TextField placeholder='Book Name Here' onChange={(e) => setQuery(e.target.value)} sx={{backgroundColor: 'whitesmoke', borderRadius: '8px'}}/>
        <Button onClick={() => fetchRecs(query)}>Get recs</Button>
      </Stack>
      {recs && <h3> Recommendations for query are: {recs.join(', ')} </h3>}
      <h2>{books && books.map((row) => (row.name)).join(', ')}</h2>
    </div>
  );
}

export default PythonRunner;

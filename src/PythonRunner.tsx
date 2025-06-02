import { ChangeEvent, useEffect, useState } from "react";
import Papa from 'papaparse';
import { Button, TextField, Stack, Typography, Box, Paper, List, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination } from "@mui/material";


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
  const [numBooks, setNumBooks] = useState(10);
  const [recs, setRecs] = useState<Map<String, number> | null>(null);
  const [query, setQuery] = useState('');
  const entriesPerPage = 10;
  const [paginator, setPaginator] = useState({
    from: 0,
    to: entriesPerPage,
  });

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
          .map((row: any) => createBookData(row['id'], row['name'], row['book info']));
        setBooks(results);
      });
      };
    loadData();
  }, []);


  const fetchRecs = async (bookName: string) => {
    console.log(`query is ${bookName}`)
    try {
      const response = await fetch('http://127.0.0.1:5000/api/recommend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'title': bookName, 'num_books': numBooks})
      })
      console.log('response: ', response);

      if (!response.ok) {
        throw new Error('failed response for book recommendations');
      }
      const data = await response.json();
      const recs = data['results'];
      const recsMap = new Map<string, number>(Object.entries(recs));
      setRecs(recsMap);
    } catch (error) {
      console.error('there was an error retrieving the response', error)
    }
  }

  const handlePageChange = (event: ChangeEvent<unknown>, page: number) => {
    if (event) {
      const from = (page - 1) * entriesPerPage;
      const to = from + entriesPerPage;
      setPaginator({ from: from, to: to });
    }
  }

  return (
    <Box>
      <Typography variant='h2'>get all your spicy book recs</Typography>
      <Stack direction='row' justifyContent='center'>
        <TextField 
          placeholder='Book Name Here' 
          onChange={(e) => setQuery(e.target.value)} 
          sx={{ backgroundColor: 'whitesmoke', borderRadius: '8px' }}
        />
        <TextField 
          placeholder='Number of recs' 
          type='number'
          onChange={(e) => setNumBooks(Number(e.target.value))}
          inputProps={{ min: 1, max: 200 }}
          sx={{ inputMode: 'numeric', pattern: '[0-9]*', backgroundColor: 'whitesmoke', borderRadius: '8px'}}
        />
        <Button onClick={() => fetchRecs(query)}>Get recs</Button>
      </Stack>
      {recs && 
        <Box>
          <Typography variant='h5' paddingTop='30px'> 
            Recommendations for query
          </Typography>
            {recs.size !== 0 && Array.from(Array.from(recs).map(entry => `${entry[0]} (${entry[1]})`)).reverse().map(e => 
              <Typography>{e}</Typography>
            )}
            {recs.size == 0 && <Typography> Searched title not found in database </Typography>}
        </Box>
      }
      <Box paddingX='150px' paddingY='30px'>
        <List>
          <TableContainer component={Paper}>
            <Typography variant='h4' paddingTop='10px'> Book list </Typography>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold', m: 1 }}> Book name </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold', m: 1 }}> Description </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold', m: 1 }}> Id </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {books && 
                      books.slice(paginator.from, paginator.to).map((book, index) => (
                        <TableRow key={index}>
                          <TableCell>{book.name}</TableCell>
                          <TableCell>{book.bookInfo.toString().split(' ').slice(0, 30).join(' ')}</TableCell>
                          <TableCell>{book.id}</TableCell>
                        </TableRow>
                      ))
                    }
                </TableBody>
            </Table>
            <Box display='flex' justifyContent='center' alignItems='center' paddingY='10px'>
              <Pagination count={Math.ceil(books?.length || entriesPerPage / entriesPerPage)} onChange={handlePageChange}/>
            </Box>
          </TableContainer>
        </List>
      </Box>
    </Box>
  );
}

export default PythonRunner;

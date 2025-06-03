import { ChangeEvent, useEffect, useState } from "react";
import Papa from 'papaparse';
import { Button, TextField, Stack, Typography, Box, Paper, List, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination, CircularProgress } from "@mui/material";


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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
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
      setIsLoading(false);
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
      <Stack direction='row' justifyContent='center' alignItems='center' spacing={2}>
        <TextField 
          placeholder='Book Name Here' 
          onChange={(e) => setQuery(e.target.value)} 
          sx={{ backgroundColor: 'whitesmoke', borderRadius: '8px' }}
        />
        <TextField 
          placeholder='Num recs' 
          type='number'
          onChange={(e) => setNumBooks(Number(e.target.value))}
          inputProps={{ min: 1, max: 200 }}
          sx={{ inputMode: 'numeric', pattern: '[0-9]*', width: '120px', backgroundColor: 'whitesmoke', borderRadius: '8px'}}
        />
        <Box sx={{ position: 'relative', width: '100px', height: '36px' }}>
          <Button 
            onClick={() => fetchRecs(query)} 
            disabled={isLoading}
            sx={{ color: 'white', width: '100%', height: '100%' }}>
              Get recs
          </Button>
          {isLoading && (
            <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          )}
        </Box>
      </Stack>
      {recs && 
        <Box>
          <Typography variant='h5' paddingTop='30px'> 
            Recommendations for query
          </Typography>
            {recs.size !== 0 && 
              Array.from(recs.entries())
                .sort((a, b) => a[1] - b[1]).reverse()
                  .map(([name, score]) => (
                    <Box display='flex' justifyContent='center' alignItems='center' paddingY='2px'>
                      <Paper elevation={2} sx={{ p: 2, width: '500px' }}>
                        <Typography>{name}</Typography>
                        <Typography variant='caption' color="text.secondary"> Score: {score}</Typography>
                      </Paper>
                    </Box>
                  ))
                }
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

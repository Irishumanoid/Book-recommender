import './App.css';
import PythonRunner from "./PythonRunner"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ImageAnimation from './AnimatedImage';
import { Box, Stack } from '@mui/material';

function App() {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <header className="App-header">
          <Box paddingY='20px'>
            <Stack direction='row'>
              {Array.from({ length: 7 }, (_, i) => i + 1).map(i => (
                <Box key={i}>
                  <ImageAnimation src="/fox.png" width={100} height={100} cw={false}/>
                  <ImageAnimation src="/fox.png" width={100} height={100} cw={true}/>
                </Box>
              ))}
            </Stack>
            <PythonRunner/>
          </Box>
        </header>
      </div>
    </ThemeProvider>
  );
}


export default App;

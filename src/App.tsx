import React from 'react';
import logo from './logo.svg';
import './App.css';
import PythonRunner from "./PythonRunner"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

declare global {
  interface Window {
    loadPyodide: any;
  }
}

function App() {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <PythonRunner/>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Recommender App
          </a>
        </header>
      </div>
    </ThemeProvider>
  );
}


export default App;

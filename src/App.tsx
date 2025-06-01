import React from 'react';
import logo from './logo.svg';
import './App.css';
import PythonRunner from "./PythonRunner"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <PythonRunner/>
        </header>
      </div>
    </ThemeProvider>
  );
}


export default App;

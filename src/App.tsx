import React from 'react';
import Tetris from './components/Tetris';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Tetris</h1>
      <Tetris />
    </div>
  );
};

export default App;

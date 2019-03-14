import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import PC from './components/playerCard'
import Canvas from './components/canvas'

const title = <h1 class="title">GuessMyDrawing.io</h1>;

ReactDOM.render(title, document.getElementById('root'));
ReactDOM.render(<PC />, document.getElementById('turnOrderID'));
ReactDOM.render(<Canvas />, document.getElementById('drawingID'));

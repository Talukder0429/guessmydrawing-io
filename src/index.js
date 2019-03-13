import './components/components.css';
import React from 'react';
import ReactDOM from 'react-dom';
import PC from './components/playerCard'

const title = <h1 class="title">GuessMyDrawing.io</h1>;

ReactDOM.render(title, document.getElementById('root'));
ReactDOM.render(<PC />, document.getElementById('order'));

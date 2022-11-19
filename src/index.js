import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import actionCable from "actioncable";

const CableApp = {};
CableApp.cable = actionCable.createConsumer("ws://localhost:3000/cable");

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App cable={CableApp.cable} />
  </React.StrictMode>
);

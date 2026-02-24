import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from 'react-router-dom';

// Initialize theme on first paint (no persistence). This sets a data-theme attribute
// on the root element based on the system preference to avoid a flash.
function initThemeNoStorage() {
  try {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

    // Optional: listen for system changes and update during the session
    // if (window.matchMedia) {
    //   window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    //     document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    //   });
    // }
  } catch (e) {
    // ignore
  }
}

initThemeNoStorage();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

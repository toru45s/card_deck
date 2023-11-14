import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { MainProvider } from "./Context";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

ReactDOM.render(
  <React.StrictMode>
      <MainProvider>
          <ToastContainer />
          <React.Suspense fallback={<div className="preloader" id="mainPreloader"><div className="preloader_spinner"></div></div>}>
              <Router>
                  <App />
              </Router>
          </React.Suspense>
      </MainProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

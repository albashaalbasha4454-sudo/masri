import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { installExpenseTransactionSync, seedRequiredExpenses } from './expenseSeeds';
import { seedRequiredProducts } from './productSeeds';

installExpenseTransactionSync();
seedRequiredExpenses();
seedRequiredProducts();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

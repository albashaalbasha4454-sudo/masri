import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { installExpenseTransactionSync, seedRequiredExpenses } from './expenseSeeds';
import { seedRequiredProducts } from './productSeeds';
import { seedDrawerAccountAndCashMovements } from './cashMovementSeeds';
import { applyUniqueProductImages } from './productImagePatcher';
import { installUiTextPatcher } from './uiTextPatcher';
import { installDataBridge, syncAllBusinessData } from './dataBridge';

installUiTextPatcher();
installExpenseTransactionSync();
installDataBridge();
seedRequiredExpenses();
seedRequiredProducts();
seedDrawerAccountAndCashMovements();
syncAllBusinessData();
applyUniqueProductImages();

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

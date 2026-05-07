import React from 'react';
import ReactDOM from 'react-dom/client';
import UnifiedApp from './UnifiedApp';
import './style.css';
import { installUiTextPatcher } from './uiTextPatcher';
import { installProfessionalReportExportPatcher } from './reportExportPatcher';
import { installCleanSetupPatcher } from './cleanSetupPatcher';
import { installPosAdditionPatcher } from './posAdditionPatcher';
import { installAccountingAuditButton } from './accountingAudit';

installUiTextPatcher();
installProfessionalReportExportPatcher();
installCleanSetupPatcher();
installPosAdditionPatcher();
installAccountingAuditButton();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <UnifiedApp />
  </React.StrictMode>
);

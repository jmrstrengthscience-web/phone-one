import React from 'react'
import ReactDOM from 'react-dom/client'
import AthleteApp from './AthleteApp.jsx'
import './index.css'
import { DataProvider } from './lib/MultiTenantDataContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <AthleteApp />
    </DataProvider>
  </React.StrictMode>,
)
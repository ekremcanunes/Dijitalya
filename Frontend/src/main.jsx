import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Tailwind CSS burada y�klensin

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';
import type { NoryumAPI } from '../domain/types';
declare global { interface Window { noryum:NoryumAPI; } }
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

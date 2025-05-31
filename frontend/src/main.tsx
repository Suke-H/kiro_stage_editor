import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { store } from '@/store';

import './index.css'
import PuzzleStudio from './components/puzzle-studio'
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PuzzleStudio />
      <Toaster 
        richColors 
        theme="light"
        position="top-center"  
      />
    </Provider>
  </StrictMode>,
)

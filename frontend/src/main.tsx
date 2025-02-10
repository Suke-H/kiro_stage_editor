import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { store } from './store';

import './index.css'
// import App from './App.tsx'
// import EditorPage from './components/editor-page'
import PuzzleStudio from './components/puzzle-studio'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PuzzleStudio />
    </Provider>
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'

const path = window.location.pathname

// Simple routing: /tip shows TipAuthorPage, everything else shows KitabhWebsiteBuilder
if (path === '/tip') {
  import('./TipAuthorPage').then(({ default: TipAuthorPage }) => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <TipAuthorPage />
      </React.StrictMode>
    )
  })
} else {
  import('./KitabhWebsiteBuilder').then(({ default: KitabhWebsiteBuilder }) => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <KitabhWebsiteBuilder />
      </React.StrictMode>
    )
  })
}

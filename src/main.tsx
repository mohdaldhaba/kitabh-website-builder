import React from 'react'
import ReactDOM from 'react-dom/client'

const path = window.location.pathname

const root = ReactDOM.createRoot(document.getElementById('root')!)

if (path === '/hub_v4' || path.startsWith('/hub_v4/')) {
  import('./hub/DashboardMockup').then(({ default: DashboardMockup }) => {
    root.render(<React.StrictMode><DashboardMockup /></React.StrictMode>)
  })
} else if (path === '/hub_v2' || path.startsWith('/hub_v2/')) {
  import('./hub/BusinessHubV2').then(({ default: BusinessHubV2 }) => {
    root.render(<React.StrictMode><BusinessHubV2 /></React.StrictMode>)
  })
} else if (path === '/hub_v1' || path.startsWith('/hub_v1/')) {
  import('./hub/BusinessHubV1').then(({ default: BusinessHubV1 }) => {
    root.render(<React.StrictMode><BusinessHubV1 /></React.StrictMode>)
  })
} else if (path === '/hub' || path.startsWith('/hub/')) {
  import('./hub/BusinessHub').then(({ default: BusinessHub }) => {
    root.render(<React.StrictMode><BusinessHub /></React.StrictMode>)
  })
} else if (path === '/tip') {
  import('./TipAuthorPage').then(({ default: TipAuthorPage }) => {
    root.render(<React.StrictMode><TipAuthorPage /></React.StrictMode>)
  })
} else if (path === '/checker') {
  import('./tools/KitabhChecker').then(({ default: KitabhChecker }) => {
    root.render(<React.StrictMode><KitabhChecker /></React.StrictMode>)
  })
} else if (path === '/outline') {
  import('./tools/KitabhOutline').then(({ default: KitabhOutline }) => {
    root.render(<React.StrictMode><KitabhOutline /></React.StrictMode>)
  })
} else if (path === '/social') {
  import('./tools/KitabhSocial').then(({ default: KitabhSocial }) => {
    root.render(<React.StrictMode><KitabhSocial /></React.StrictMode>)
  })
} else if (path === '/dashboard') {
  import('./components/OwnerDashboard').then(({ default: OwnerDashboard }) => {
    root.render(<React.StrictMode><OwnerDashboard /></React.StrictMode>)
  })
} else if (path.startsWith('/article/')) {
  const slug = path.replace('/article/', '')
  import('./components/ArticleViewWrapper').then(({ default: ArticleViewWrapper }) => {
    root.render(<React.StrictMode><ArticleViewWrapper articleSlug={slug} /></React.StrictMode>)
  })
} else {
  import('./KitabhWebsiteBuilder').then(({ default: KitabhWebsiteBuilder }) => {
    root.render(<React.StrictMode><KitabhWebsiteBuilder /></React.StrictMode>)
  })
}

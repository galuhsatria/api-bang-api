import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '#/styles/app.css?url'
import { Splash } from '#/components/Splash'

const themeInit = `try{var t=localStorage.getItem('runut.theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'API BANG API' },
      { name: 'theme-color', content: '#FF7A1A' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'API BANG API' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
      { rel: 'apple-touch-icon', href: '/icon-192.png' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <Splash/>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

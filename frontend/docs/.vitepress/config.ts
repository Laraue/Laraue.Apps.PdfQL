import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Laraue PDF extractor tool",
  description: "Tool",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Application', link: 'https://laraue.com/pdf-extractor' },
    ],

    sidebar: [
      {
        text: 'Stages',
        items: [
          { text: 'Select', link: '/stages/select' },
          { text: 'Select Many', link: '/stages/selectMany' },
          { text: 'Map', link: '/stages/map' },
          { text: 'Filter', link: '/stages/filter' },
          { text: 'Take', link: '/stages/take' },
          { text: 'Skip', link: '/stages/skip' },
          { text: 'Single', link: '/stages/single' },
          { text: 'First', link: '/stages/first' },
          { text: 'First or Default', link: '/stages/firstOrDefault' },
        ]
      },
      {
        text: 'Output formats',
        items: [
          { text: 'Json', link: '/output/json' },
        ]
      },
      {
        text: 'Keywords',
        items: [
          { text: 'Selector', link: '/keyword/selector' },
        ]
      },
      {
        text: 'Expressions',
        items: [
          { text: 'Constant Expression', link: '/expression/constant' },
          { text: 'Binary Expression', link: '/expression/binary' },
          { text: 'Lambda Expression', link: '/expression/lambda' },
          { text: 'Instance Method Call Expression', link: '/expression/instance-method-call' },
          { text: 'New Expression', link: '/expression/new' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/win7user10/Laraue.PdfQL' }
    ]
  },
  sitemap: {
    hostname: 'https://laraue.com/pdf-extractor/docs/'
  },
  base: '/pdf-extractor/docs/',
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-RGM3JHLBGL' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-RGM3JHLBGL');`
    ]
  ]
})

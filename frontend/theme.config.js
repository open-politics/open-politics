import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>My Project</span>,
  project: {
    link: 'https://github.com/yourusername/your-repo',
  },
  docsRepositoryBase: 'https://github.com/yourusername/your-repo/tree/main/pages/docs',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – My Project Docs'
    }
  },
  // ... other config options
}

export default config

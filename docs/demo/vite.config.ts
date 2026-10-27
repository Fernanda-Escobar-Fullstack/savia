import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoRoot = path.resolve(__dirname, '../..')
const demoRoot = path.resolve(__dirname)

const replacements = new Map([
  ['components/AuthListener', path.join(demoRoot, 'DemoAuthListener.tsx')],
  ['services/libraryService', path.join(demoRoot, 'services/libraryService.ts')],
  ['services/readingStatusService', path.join(demoRoot, 'services/readingStatusService.ts')],
  ['services/wishlistService', path.join(demoRoot, 'services/wishlistService.ts')],
  ['services/notificationService', path.join(demoRoot, 'services/notificationService.ts')],
  ['services/reservationCancellationService', path.join(demoRoot, 'services/reservationCancellationService.ts')],
  ['services/authService', path.join(demoRoot, 'services/authService.ts')],
])

export default defineConfig({
  root: repoRoot,
  plugins: [
    {
      name: 'savia-portfolio-demo-adapter',
      enforce: 'pre',
      resolveId(source) {
        const normalized = source.replaceAll('\\', '/')

        for (const [suffix, replacement] of replacements) {
          if (normalized.endsWith(suffix)) {
            return replacement
          }
        }

        return null
      },
    },
    react(),
  ],
})

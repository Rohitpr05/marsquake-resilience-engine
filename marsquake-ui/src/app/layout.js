import './globals.css'
import './mission-control.css'

export const metadata = {
  title: 'Marsquake Simulator - Mission Control',
  description: 'Mars Habitat Resilience Lab',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
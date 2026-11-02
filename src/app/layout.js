import { Playfair_Display, Inter } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/registry';
import Providers from '@/components/layout/Providers';
import './globals.css';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata = {
  title: 'RootEco — Premium Corporate Gifting',
  description:
    'Thoughtful corporate gifting, festival hampers, welcome kits and branded merchandise. Curated, customized and delivered pan India.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

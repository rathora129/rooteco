'use client';

import { ThemeProvider } from 'styled-components';
import theme from '@/styles/theme';
import { StoreProvider } from '@/lib/store';

export default function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}

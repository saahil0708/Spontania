'use client';

import { Provider } from 'react-redux';
import { store } from '../redux/store';
import ThemeRegistry from '../theme/ThemeRegistry';
import { ReactNode } from 'react';

import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeRegistry>
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </ThemeRegistry>
    </Provider>
  );
}

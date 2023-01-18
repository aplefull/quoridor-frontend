// LIBRARIES
import { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';

type TProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: TProvidersProps) => {
  return (
    <MantineProvider withGlobalStyles withCSSVariables theme={{ colorScheme: 'dark' }}>
      {children}
    </MantineProvider>
  );
};

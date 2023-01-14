import { MantineProvider } from '@mantine/core';
import React, { ReactNode } from 'react';

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

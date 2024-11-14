import React, { ReactNode } from 'react';

interface TabPanelProps {
  children: ReactNode;
  label: string;
}

export function TabPanel({ children }: TabPanelProps) {
  return <div>{children}</div>;
}
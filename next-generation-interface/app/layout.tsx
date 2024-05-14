import React from 'react';
import '../styles/globals.css';

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>My Globe App</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;

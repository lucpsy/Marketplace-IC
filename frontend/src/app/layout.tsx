export default function RootLayout({children,}: {children: React.ReactNode;}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Primeira página em next</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
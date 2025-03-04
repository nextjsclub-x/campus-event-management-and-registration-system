import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'
      suppressHydrationWarning>
      <body className='flex flex-col justify-start items-center w-full'>
        {children}
      </body>
    </html>
  );
}


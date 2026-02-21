;;// This root layout is only used when the middleware doesn't run or when there's an error.
// The actual application layout is in src/app/[locale]/layout.tsx.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

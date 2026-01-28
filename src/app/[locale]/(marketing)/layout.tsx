export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* يمكنك وضع الـ Navbar الخاص بالموقع هنا لاحقاً */}
      {/* <Navbar /> */}
      
      <main className="flex-1">
        {children}
      </main>

      {/* يمكنك وضع الـ Footer هنا لاحقاً */}
      {/* <Footer /> */}
    </div>
  );
}
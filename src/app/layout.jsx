import './globals.css';
import ClientLayoutShell from './components/ClientLayoutShell';

export const metadata = {
  title: 'مدرسه علم و هنر',
  description: 'مدرسه غیردولتی هنر و علم بجنورد',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased">
        <ClientLayoutShell>{children}</ClientLayoutShell>
      </body>
    </html>
  );
}
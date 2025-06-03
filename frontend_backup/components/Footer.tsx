export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center justify-center py-6 text-xs text-muted-foreground border-t border-border bg-background">
      <div className="mb-2">© 2024 Hirela AI. All rights reserved.</div>
      <div className="flex gap-4">
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Terms of Service</a>
      </div>
    </footer>
  );
} 
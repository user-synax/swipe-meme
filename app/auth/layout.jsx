export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary tracking-tight">MemeMate</h1>
        <p className="text-muted-foreground mt-2">Swipe. Match. Laugh.</p>
      </div>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}

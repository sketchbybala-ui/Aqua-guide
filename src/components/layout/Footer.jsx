export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-brand-900 text-brand-100">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Aqua Guide" className="h-8 w-8 object-contain" />
            <span className="font-semibold text-white">Aqua Guide</span>
          </div>
          <p className="text-brand-200">Pure Water. Better Life.</p>
          <p className="text-brand-300">&copy; {new Date().getFullYear()} Aqua Guide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

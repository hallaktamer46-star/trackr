import Header from './Header'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="max-w-screen-xl mx-auto p-3 md:p-6">
        {children}
      </main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black pt-20">
      {children}
    </div>
  )
}

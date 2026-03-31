import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    redirect('/login')
  }

  const userProps = {
    fullName: profile.fullName,
    role: profile.role,
    email: profile.email,
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar user={{ fullName: userProps.fullName, role: userProps.role }} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={userProps} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

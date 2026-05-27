import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import AuthGuard from '@/components/layout/AuthGuard';
import { UserProvider } from '@/context/UserContext';
import { DataProvider } from '@/context/DataContext';
import dynamic from 'next/dynamic';

const AICoachWidget = dynamic(() => import('@/components/ui/AICoachWidget'), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
    <AuthGuard>
    <DataProvider>
      <div className="relative min-h-screen">
        <div className="orb w-[500px] h-[500px] top-[-100px] left-[-100px]" style={{ background: '#7c3aed' }} />
        <div className="orb w-[400px] h-[400px] bottom-[-80px] right-[-80px]" style={{ background: '#0e7490' }} />
        <div className="orb w-[300px] h-[300px] top-[40%] left-[40%]" style={{ background: '#be185d' }} />
        <div className="flex h-screen overflow-hidden relative z-10">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
              {children}
            </main>
          </div>
        </div>
        <AICoachWidget />
      </div>
    </DataProvider>
    </AuthGuard>
    </UserProvider>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import NavigationProgress from "@/components/layout/NavigationProgress";
import PageTransition from "@/components/layout/PageTransition";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavigationProgress />
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: "256px" }}>
        <PageTransition style={{ padding: "24px 24px 80px" }}>
          <div className="max-w-container mx-auto">
            {children}
          </div>
        </PageTransition>
      </main>
    </div>
  );
}

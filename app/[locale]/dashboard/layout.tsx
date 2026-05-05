import initTranslations from "@/app/i18n";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { MyListingsProvider } from "@/components/providers/my-listings-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { NotificationsProvider } from "@/components/providers/notifications-provider";
import SidebarProvider from "@/components/providers/sidebar-provider";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const namespaces = ["dashboard", "common", "property-form"];
  const { resources } = await initTranslations(locale,namespaces );

  return (
    <TranslationsProvider locale={locale} namespaces={namespaces} resources={resources}>
      <NotificationsProvider>
        <WalletProvider>
          <MyListingsProvider>
            <SidebarProvider>
            {/* <div className="flex rtl:flex-row-reverse min-h-screen bg-zinc-50 font-sans text-zinc-900"> */}
              {/* Sidebar */}
              <Sidebar locale={locale} />

              {/* Main Content */}
              <div className="flex flex-1 flex-col lg:pl-64  rtl:lg:pl-0 rtl:lg:pr-64">
                {/* Header */}
                <DashboardHeader />

                <main className="flex-1 p-6 lg:p-8">
                  {children}
                </main>
              </div>
            {/* </div> */}
            </SidebarProvider>
          </MyListingsProvider>
        </WalletProvider>
      </NotificationsProvider>
    </TranslationsProvider>
  );
}

"use client";

import { Appearance } from "./contents/appearance";
import { Notification } from "./contents/notifications";
import { Icon } from "../..";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Separator } from "../../ui/separator";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@workspace/hooks";
import { cn } from "@workspace/utils";
import { icons } from "lucide-react";

export type DefinitionTab = {
  id: string;
  label: string;
  icon: keyof typeof icons;
  component: React.ReactNode;
  category: "general" | "workplace";
}

interface DefSetupProps {
  disabledTabs?: string[];
  extraTabs?: DefinitionTab[];
}

export function DefSetup({ disabledTabs = [], extraTabs = [] }: DefSetupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const allTabs: DefinitionTab[] = [
    {
      id: "appearance",
      label: "Aparência",
      icon: "Pencil",
      component: <Appearance />,
      category: "general",
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: "Bell",
      component: <Notification />,
      category: "general",
    }
  ];

  const tabs = [...allTabs, ...extraTabs];

  const enabledTabs = tabs.filter((tab) => !disabledTabs.includes(tab.id));
  const generalTabs = enabledTabs.filter((tab) => tab.category === "general");
  const workplaceTabs = enabledTabs.filter(
    (tab) => tab.category === "workplace",
  );

  if (enabledTabs.length === 0) return null;

  const defaultTab = enabledTabs[0]?.id || "appearance";
  const activeTab =
    currentTab && enabledTabs.some((t) => t.id === currentTab)
      ? currentTab
      : defaultTab;

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

    const renderTabTrigger = (
        tab: (typeof tabs)[0],
        isDesktop: boolean = true,
    ) => {
        const baseClasses = isDesktop
            ? "flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-lg hover:bg-accent/50 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none shadow-none border-none justify-start"
            : "data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e";

        return (
            <TabsTrigger key={tab.id} value={tab.id} className={baseClasses}>
                <Icon
                    name={tab.icon}
                    className={cn(
                        "shrink-0 transition-colors",
                        isDesktop ? (activeTab === tab.id ? "text-primary" : "text-muted-foreground/70") : ""
                    )}
                    size={18}
                />
                {isDesktop && (
                    <span className="truncate">{tab.label}</span>
                )}
            </TabsTrigger>
        );
    };

  return (
    <div className="w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Definições do Sistema</h1>
        <p className="text-muted-foreground">Gerencie as preferências e configurações da sua conta.</p>
      </div>
      
      <div className="hidden md:block">
        <Tabs
          value={activeTab}
          className="flex flex-row gap-8 w-full items-start"
          onValueChange={handleTabChange}
        >
          <div className="w-64 shrink-0 bg-muted/30 rounded-xl border p-2">
            <TabsList className="flex flex-col gap-1 bg-transparent rounded-none w-full h-auto">
              <div className="px-2 py-3 space-y-6">
                {generalTabs.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                      Gerais
                    </p>
                    <div className="space-y-1">
                      {generalTabs.map((tab) => renderTabTrigger(tab, true))}
                    </div>
                  </div>
                )}
                {generalTabs.length > 0 && workplaceTabs.length > 0 && (
                  <Separator className="mx-2 opacity-50" />
                )}
                {workplaceTabs.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                      Workspace
                    </p>
                    <div className="space-y-1">
                      {workplaceTabs.map((tab) => renderTabTrigger(tab, true))}
                    </div>
                  </div>
                )}
              </div>
            </TabsList>
          </div>

          <div className="flex-1 bg-card rounded-xl border shadow-sm min-h-[500px]">
            {enabledTabs.map((tab) => (
              <TabsContent 
                key={tab.id} 
                value={tab.id} 
                className="m-0 p-8 focus-visible:outline-none focus-visible:ring-0"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold">{tab.label}</h2>
                  <Separator className="mt-4" />
                </div>
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      <div className="block mt-8 md:hidden">
        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="h-auto w-full min-w-full inline-flex p-0 bg-muted/30 rounded-lg overflow-x-auto overflow-y-hidden scrollbar-hide">
              {enabledTabs.map((tab) => renderTabTrigger(tab, false))}
            </TabsList>
          </div>

          <div className="mt-6 bg-card rounded-xl border p-6 shadow-sm">
            {enabledTabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="focus-visible:outline-none focus-visible:ring-0 m-0"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-bold">{tab.label}</h2>
                  <Separator className="mt-2" />
                </div>
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}

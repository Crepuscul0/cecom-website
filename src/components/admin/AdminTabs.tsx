import { AdminTab } from '@/types/admin';
import { useTranslations } from 'next-intl';

interface AdminTabsProps {
  tabs: AdminTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function AdminTabs({ tabs, activeTab, onTabChange }: AdminTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {tab.name}
            <span className="ml-2 bg-accent text-foreground py-0.5 px-2.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
import { X } from 'lucide-react';

interface TabsProps {
    tabs: any[];
    activeTab: string | null;
    onSwitch: (tabId: string) => void;
    onClose: (tabId: string, e: React.MouseEvent) => void;
}

export function Tabs({ tabs, activeTab, onSwitch, onClose }: TabsProps) {
    if (tabs.length === 0) return null;

    return (
        <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
            {tabs.map((tab) => (
                <div
                    key={tab.Name}
                    onClick={() => onSwitch(tab.Name)}
                    className={`
                        group flex items-center gap-2 px-4 py-2.5 text-sm border-r border-border cursor-pointer select-none min-w-[150px] max-w-[250px]
                        ${activeTab === tab.Name
                            ? 'bg-background text-foreground font-medium border-t-2 border-t-primary'
                            : 'bg-muted/30 text-muted-foreground hover:bg-background/50 hover:text-foreground border-t-2 border-t-transparent'}
                    `}
                >
                    <span className="truncate flex-1">{tab.Name}</span>
                    <button
                        onClick={(e) => onClose(tab.Name, e)}
                        className={`p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 transition-all
                            ${activeTab === tab.Name ? 'opacity-100' : ''}
                        `}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
    );
}

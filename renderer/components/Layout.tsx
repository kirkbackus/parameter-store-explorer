import React from 'react';
import { Database, Key, Settings, Cloud } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <div className="w-16 flex flex-col items-center py-4 border-r border-border bg-card">
                <div className="mb-8">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        P
                    </div>
                </div>
                <nav className="flex flex-col gap-4 w-full">
                    <NavItem icon={<Key className="w-6 h-6" />} active />
                    <NavItem icon={<Database className="w-6 h-6" />} />
                    <NavItem icon={<Cloud className="w-6 h-6" />} />
                </nav>
                <div className="mt-auto">
                    <NavItem icon={<Settings className="w-6 h-6" />} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}

function NavItem({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
    return (
        <button
            className={`w-full h-12 flex items-center justify-center transition-colors relative ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
        >
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
            )}
            {icon}
        </button>
    );
}

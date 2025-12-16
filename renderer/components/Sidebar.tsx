import { ProfileSelector } from './ProfileSelector';
import { Search, Plus, RefreshCw, AlertTriangle } from 'lucide-react';

interface SidebarProps {
    profiles: string[];
    selectedProfile: string;
    onSelectProfile: (profile: string) => void;
    search: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    loading: boolean;
    parameters: any[];
    onSelectParameter: (param: any) => void;
    onAddParameter: () => void;
    error: { message: string; isCredentialsError: boolean } | null;
    onFixError: () => void;
}

export function Sidebar({
    profiles,
    selectedProfile,
    onSelectProfile,
    search,
    onSearchChange,
    onRefresh,
    loading,
    parameters,
    onSelectParameter,
    onAddParameter,
    error,
    onFixError
}: SidebarProps) {
    return (
        <div className="w-80 border-r border-border flex flex-col bg-card h-full">
            {/* Header */}
            <div className="p-4 border-b border-border space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-semibold">Parameter Store</span>
                    <button
                        onClick={onRefresh}
                        className="p-1.5 hover:bg-accent rounded-md transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <ProfileSelector
                    profiles={profiles}
                    selectedProfile={selectedProfile}
                    onSelect={onSelectProfile}
                />
            </div>

            {/* Search */}
            <div className="p-2 border-b border-border bg-background">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search path..."
                        className="w-full pl-8 pr-3 py-1.5 bg-secondary/50 border-none rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
                {error ? (
                    <div className="p-4 space-y-3">
                        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-red-400 font-medium">Error Loading Parameters</p>
                                <p className="text-xs text-muted-foreground mt-1 break-words">{error.message}</p>
                            </div>
                        </div>
                        {error.isCredentialsError && (
                            <button
                                onClick={onFixError}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md text-sm font-medium hover:bg-amber-500/30 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Run SSO Login</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {parameters.map((param) => (
                            <div
                                key={param.Name}
                                onClick={() => onSelectParameter(param)}
                                className="px-4 py-2 border-b border-border/50 hover:bg-accent/50 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${param.Type === 'SecureString' ? 'bg-purple-500/10 text-purple-500' :
                                        param.Type === 'StringList' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-green-500/10 text-green-500'
                                        }`}>
                                        {param.Type}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">v{param.Version}</span>
                                </div>
                                <div className="text-sm font-medium truncate" title={param.Name}>
                                    {param.Name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(param.LastModifiedDate).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {parameters.length === 0 && (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                {loading ? 'Loading...' : 'No parameters found'}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-2 border-t border-border">
                <button
                    onClick={onAddParameter}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Parameter</span>
                </button>
            </div>
        </div>
    );
}

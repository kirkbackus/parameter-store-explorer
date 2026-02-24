import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Sidebar } from '@/components/Sidebar';
import { Tabs } from '@/components/Tabs';
import { ParameterView } from '@/components/ParameterView';
import { KeyDrawer, DrawerMode } from '@/components/KeyDrawer';

export default function Home() {
    // App State
    const [profiles, setProfiles] = useState<string[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<string>('');

    // Sidebar State
    const [parameters, setParameters] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    // Tab State
    const [openTabs, setOpenTabs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
    const [drawerParameter, setDrawerParameter] = useState<any | null>(null);

    // Error State
    const [error, setError] = useState<{ message: string; isCredentialsError: boolean } | null>(null);

    // Initial Load
    useEffect(() => {
        if (window.electron) {
            window.electron.listProfiles().then(p => {
                setProfiles(p);
                if (p.length > 0) setSelectedProfile(p[0]);
            });
        }
    }, []);

    // Fetch Parameters when profile changes
    useEffect(() => {
        if (selectedProfile && window.electron) {
            fetchParameters();
            // Clear tabs when profile changes
            setOpenTabs([]);
            setActiveTab(null);
        }
    }, [selectedProfile]);

    // Debounced Search
    useEffect(() => {
        if (!selectedProfile || !window.electron) return;

        const timer = setTimeout(() => {
            fetchParameters();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, selectedProfile]);

    const fetchParameters = async () => {
        setLoading(true);
        setError(null);
        try {
            let apiPath = '/';
            let filterQuery = '';

            const trimmedSearch = search.trim();
            if (trimmedSearch) {
                // Ensure starts with /
                const normalizedSearch = trimmedSearch.startsWith('/') ? trimmedSearch : `/${trimmedSearch}`;

                // If ends with /, treat as pure path
                if (normalizedSearch.endsWith('/')) {
                    apiPath = normalizedSearch;
                } else {
                    // Split at last slash
                    const lastSlashIndex = normalizedSearch.lastIndexOf('/');
                    // Path includes the slash for the API
                    apiPath = normalizedSearch.substring(0, lastSlashIndex + 1);
                    // Filter is the rest
                    filterQuery = normalizedSearch.substring(lastSlashIndex + 1);
                }
            }

            // Ensure path is at least '/'
            if (!apiPath) apiPath = '/';

            const params = await window.electron.listParameters(selectedProfile, apiPath, true);

            // Client-side filter
            if (filterQuery) {
                const lowerFilter = filterQuery.toLowerCase();
                const filtered = params.filter(p => p.Name.toLowerCase().includes(lowerFilter));
                setParameters(filtered);
            } else {
                setParameters(params);
            }
        } catch (err: any) {
            console.error(err);
            setParameters([]);
            const errorMessage = err?.message || String(err);
            const isCredentialsError = errorMessage.includes('CredentialsProviderError') ||
                errorMessage.includes('Token is expired') ||
                errorMessage.includes('SSO session');
            setError({ message: errorMessage, isCredentialsError });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectParameter = async (param: any) => {
        // Check if already open
        if (openTabs.find(t => t.Name === param.Name)) {
            setActiveTab(param.Name);
            return;
        }

        // Fetch full details (decrypted)
        try {
            const fullParam = await window.electron.getParameter(selectedProfile, param.Name, true);
            if (fullParam) {
                setOpenTabs(prev => [...prev, fullParam]);
                setActiveTab(fullParam.Name);
            }
        } catch (err) {
            console.error('Failed to fetch parameter details', err);
        }
    };

    const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newTabs = openTabs.filter(t => t.Name !== tabId);
        setOpenTabs(newTabs);

        if (activeTab === tabId) {
            setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].Name : null);
        }
    };

    const handleSaveParameter = () => {
        fetchParameters();
    };

    const handleFixError = async () => {
        try {
            await window.electron.loginSSO(selectedProfile);
            setError(null);
            fetchParameters();
        } catch (err) {
            console.error('Failed to run SSO login:', err);
        }
    };

    // Drawer action handlers
    const openDrawer = (mode: DrawerMode, param?: any) => {
        setDrawerMode(mode);
        setDrawerParameter(param || null);
        setIsDrawerOpen(true);
    };

    const handleEdit = () => {
        const param = openTabs.find(t => t.Name === activeTab);
        if (param) {
            openDrawer('edit', param);
        }
    };

    const handleDuplicate = () => {
        const param = openTabs.find(t => t.Name === activeTab);
        if (param) {
            openDrawer('duplicate', param);
        }
    };

    const handleRename = () => {
        const param = openTabs.find(t => t.Name === activeTab);
        if (param) {
            openDrawer('rename', param);
        }
    };

    const handleRenameComplete = async (oldName: string, newName: string) => {
        // Close the old tab and open the new one
        setOpenTabs(prev => prev.filter(t => t.Name !== oldName));
        if (activeTab === oldName) {
            try {
                const newParam = await window.electron.getParameter(selectedProfile, newName, true);
                if (newParam) {
                    setOpenTabs(prev => [...prev, newParam]);
                    setActiveTab(newName);
                }
            } catch (err) {
                console.error('Failed to fetch renamed parameter', err);
                setActiveTab(null);
            }
        }
    };

    const handleDrawerSave = async () => {
        await fetchParameters();
        // If editing, refresh the tab content
        if (drawerMode === 'edit' && drawerParameter) {
            try {
                const updatedParam = await window.electron.getParameter(selectedProfile, drawerParameter.Name, true);
                if (updatedParam) {
                    setOpenTabs(prev => prev.map(t =>
                        t.Name === drawerParameter.Name ? updatedParam : t
                    ));
                }
            } catch (err) {
                console.error('Failed to refresh parameter', err);
            }
        }
    };

    const activeParameter = openTabs.find(t => t.Name === activeTab);

    return (
        <Layout>
            <div className="flex h-full overflow-hidden relative">
                <Sidebar
                    profiles={profiles}
                    selectedProfile={selectedProfile}
                    onSelectProfile={setSelectedProfile}
                    search={search}
                    onSearchChange={setSearch}
                    onRefresh={fetchParameters}
                    loading={loading}
                    parameters={parameters}
                    onSelectParameter={handleSelectParameter}
                    onAddParameter={() => openDrawer('create')}
                    error={error}
                    onFixError={handleFixError}
                />

                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    <Tabs
                        tabs={openTabs}
                        activeTab={activeTab}
                        onSwitch={setActiveTab}
                        onClose={handleCloseTab}
                    />

                    <ParameterView
                        parameter={activeParameter}
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onRename={handleRename}
                    />
                </div>

                <KeyDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    parameter={drawerParameter}
                    profile={selectedProfile}
                    onSave={handleDrawerSave}
                    mode={drawerMode}
                    onRenameComplete={handleRenameComplete}
                />
            </div>
        </Layout>
    );
}

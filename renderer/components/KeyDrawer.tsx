import React, { useState, useEffect } from 'react';
import { X, Copy, Eye, EyeOff, Save, Edit3 } from 'lucide-react';

export type DrawerMode = 'create' | 'edit' | 'duplicate' | 'rename';

interface KeyDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    parameter: any | null;
    profile: string;
    onSave: () => void;
    mode: DrawerMode;
    onRenameComplete?: (oldName: string, newName: string) => void;
}

export function KeyDrawer({ isOpen, onClose, parameter, profile, onSave, mode, onRenameComplete }: KeyDrawerProps) {
    const [name, setName] = useState('');
    const [newName, setNewName] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState('String');
    const [showValue, setShowValue] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                setName('');
                setNewName('');
                setValue('');
                setType('String');
            } else if (parameter) {
                setName(parameter.Name);
                setNewName('');
                setType(parameter.Type);
                setValue('Loading...');
                // Fetch full value (decrypted)
                if (window.electron) {
                    window.electron.getParameter(profile, parameter.Name, true).then((p: any) => {
                        setValue(p.Value || '');
                    });
                }
            }
        }
    }, [parameter, profile, isOpen, mode]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (window.electron) {
                if (mode === 'rename') {
                    // Create new parameter with new name
                    await window.electron.putParameter(profile, newName, value, type);
                    // Delete old parameter
                    await window.electron.deleteParameter(profile, name);
                    if (onRenameComplete) {
                        onRenameComplete(name, newName);
                    }
                } else if (mode === 'duplicate') {
                    // Create new parameter with new name
                    await window.electron.putParameter(profile, name, value, type);
                } else {
                    // Create or edit: use the name field
                    await window.electron.putParameter(profile, name, value, type);
                }
                onSave();
                onClose();
            }
        } catch (err) {
            console.error(err);
            alert(`Failed to ${mode === 'rename' ? 'rename' : mode === 'duplicate' ? 'duplicate' : 'save'} parameter`);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Add New Key';
            case 'edit': return 'Edit Parameter';
            case 'duplicate': return 'Duplicate Parameter';
            case 'rename': return 'Rename Parameter';
        }
    };

    const getButtonText = () => {
        if (loading) return 'Saving...';
        switch (mode) {
            case 'create': return 'Create Key';
            case 'edit': return 'Save Changes';
            case 'duplicate': return 'Create Duplicate';
            case 'rename': return 'Rename';
        }
    };

    const isNameDisabled = mode === 'edit' || mode === 'rename';
    const isTypeDisabled = mode === 'edit';
    const isValueReadOnly = false; // All modes allow editing the value

    const getNameForSave = () => {
        if (mode === 'rename') return newName;
        return name;
    };

    const isValidForSave = () => {
        if (mode === 'rename') {
            return newName.trim() !== '' && newName !== name && value !== '';
        }
        if (mode === 'duplicate') {
            return name.trim() !== '' && value !== '';
        }
        return name.trim() !== '' && value !== '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-[600px] bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
                    <h2 className="font-semibold text-lg">
                        {getTitle()}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {mode === 'rename' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Current Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    disabled
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">New Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="/app/service/new-key"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Key Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isNameDisabled}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                                placeholder="/app/service/key"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled={isTypeDisabled}
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                        >
                            <option value="String">String</option>
                            <option value="SecureString">SecureString</option>
                            <option value="StringList">StringList</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex justify-between">
                            <span>Value</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowValue(!showValue)}
                                    className="text-xs flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                    {showValue ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    {showValue ? 'Hide' : 'Show'}
                                </button>
                                <button
                                    onClick={() => navigator.clipboard.writeText(value)}
                                    className="text-xs flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </button>
                            </div>
                        </label>
                        <div className="relative">
                            <textarea
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                rows={10}
                                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:ring-1 focus:ring-primary outline-none font-mono text-sm"
                                style={{
                                    WebkitTextSecurity: !showValue && type === 'SecureString' ? 'disc' : 'none'
                                } as any}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-border bg-card flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !isValidForSave()}
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" /> {getButtonText()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

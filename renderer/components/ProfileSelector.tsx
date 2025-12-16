import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ProfileSelectorProps {
    profiles: string[];
    selectedProfile: string;
    onSelect: (profile: string) => void;
}

export function ProfileSelector({ profiles, selectedProfile, onSelect }: ProfileSelectorProps) {
    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors">
                <span>{selectedProfile || 'Select Profile'}</span>
                <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg overflow-hidden hidden group-hover:block z-50">
                <div className="max-h-60 overflow-y-auto">
                    {profiles.map((profile) => (
                        <button
                            key={profile}
                            onClick={() => onSelect(profile)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            {profile}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

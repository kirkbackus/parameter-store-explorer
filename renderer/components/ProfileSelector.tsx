import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface ProfileSelectorProps {
    profiles: string[];
    selectedProfile: string;
    onSelect: (profile: string) => void;
}

export function ProfileSelector({ profiles, selectedProfile, onSelect }: ProfileSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (profile: string) => {
        onSelect(profile);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80 transition-colors"
            >
                <span>{selectedProfile || 'Select Profile'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-50">
                    <div className="max-h-60 overflow-y-auto">
                        {profiles.map((profile) => (
                            <button
                                key={profile}
                                onClick={() => handleSelect(profile)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${profile === selectedProfile ? 'bg-accent/50 text-accent-foreground' : ''
                                    }`}
                            >
                                {profile}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

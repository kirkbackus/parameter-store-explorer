import { Copy, Pencil, Files, ArrowRightLeft } from 'lucide-react';

interface ParameterViewProps {
    parameter: any;
    onEdit?: () => void;
    onDuplicate?: () => void;
    onRename?: () => void;
}

export function ParameterView({ parameter, onEdit, onDuplicate, onRename }: ParameterViewProps) {
    if (!parameter) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a parameter to view details
            </div>
        );
    }

    const handleCopyValue = () => {
        if (parameter.Value) {
            navigator.clipboard.writeText(parameter.Value);
        }
    };

    return (
        <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl font-semibold break-all">{parameter.Name}</h1>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={onEdit}
                                className="text-sm flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors px-2 py-1 hover:bg-accent rounded-md"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={onDuplicate}
                                className="text-sm flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors px-2 py-1 hover:bg-accent rounded-md"
                            >
                                <Files className="w-3.5 h-3.5" />
                                Duplicate
                            </button>
                            <button
                                onClick={onRename}
                                className="text-sm flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors px-2 py-1 hover:bg-accent rounded-md"
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                Rename
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Type:</span>
                            <span>{parameter.Type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Version:</span>
                            <span>{parameter.Version}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">Last Modified:</span>
                            <span>{new Date(parameter.LastModifiedDate).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Value Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Value</h2>
                        <button
                            onClick={handleCopyValue}
                            className="text-xs flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
                        >
                            <Copy className="w-3 h-3" />
                            Copy
                        </button>
                    </div>
                    <div className="bg-muted/30 border border-border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap break-all">
                        {parameter.Value || <span className="text-muted-foreground italic">No value (or SecureString not decrypted)</span>}
                    </div>
                </div>

                {/* Metadata Section */}
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Metadata</h2>
                    <div className="bg-card border border-border rounded-lg divide-y divide-border">
                        <div className="grid grid-cols-3 p-3 text-sm">
                            <span className="text-muted-foreground">ARN</span>
                            <span className="col-span-2 font-mono text-xs break-all">{parameter.ARN || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-3 p-3 text-sm">
                            <span className="text-muted-foreground">Data Type</span>
                            <span className="col-span-2">{parameter.DataType || 'text'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

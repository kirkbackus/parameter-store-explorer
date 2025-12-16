export interface ElectronAPI {
    listProfiles: () => Promise<string[]>;
    listParameters: (profile: string, path?: string, recursive?: boolean) => Promise<any[]>;
    getParameter: (profile: string, name: string, withDecryption?: boolean) => Promise<any>;
    putParameter: (profile: string, name: string, value: string, type: string) => Promise<boolean>;
    deleteParameter: (profile: string, name: string) => Promise<boolean>;
    loginSSO: (profile: string) => Promise<boolean>;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}

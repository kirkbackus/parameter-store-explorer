import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    listProfiles: () => ipcRenderer.invoke('aws:list-profiles'),
    listParameters: (profile: string, path?: string, recursive?: boolean) => ipcRenderer.invoke('aws:list-parameters', profile, path, recursive),
    getParameter: (profile: string, name: string, withDecryption?: boolean) => ipcRenderer.invoke('aws:get-parameter', profile, name, withDecryption),
    putParameter: (profile: string, name: string, value: string, type: string) => ipcRenderer.invoke('aws:put-parameter', profile, name, value, type),
    deleteParameter: (profile: string, name: string) => ipcRenderer.invoke('aws:delete-parameter', profile, name),
    loginSSO: (profile: string) => ipcRenderer.invoke('aws:login-sso', profile),
});

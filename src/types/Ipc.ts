import { IUser } from 'minecraft-launcher-core'
import { ipcMain, ipcRenderer } from 'electron'
import { TypedIpcMain, TypedIpcRenderer } from 'electron-typed-ipc'
import * as RPC from 'discord-rpc'
import Modpack from './Modpack'

export type Events = {
    MinecraftClosed: (exitCode: number) => void
    DownloadStatus: (status: Record<string, any>) => void
    DownloadProgress: (progress: Record<string, any>) => void
    PackageExtracted: () => void

}

type Commands = {
    LaunchMinecraft: (modpack: Modpack, user: IUser) => void
    UpdatePresence: (newPresence: RPC.Presence) => void
}

export const typedIpcMain = ipcMain as TypedIpcMain<Events, Commands>
export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>

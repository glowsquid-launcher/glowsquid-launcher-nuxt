import { EventEmitter } from 'events'
import { BrowserWindow, app, ipcMain } from 'electron'
import * as RPC from 'discord-rpc'
import Store from 'electron-store'

export default class BrowserWinHandler {
  /**
     * @param [options] {object} - browser window options
     * @param [allowRecreate] {boolean}
     */
  constructor (options, allowRecreate = true) {
    this._eventEmitter = new EventEmitter()
    this.allowRecreate = allowRecreate
    this.options = options
    this.browserWindow = null
    this._createInstance()
  }

  _createInstance () {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      Store.initRenderer()
      const client = new RPC.Client({
        transport: 'ipc'
      })

      let prevActivity = {
        details: 'Looking around 👀',
        state: 'Not signed in yet',
        startTimestamp: new Date(),
        largeImageKey: 'glowsquid',
        largeImageText: 'Coming not soon™'
      }

      client.on('ready', () => {
        client.setActivity({
          details: 'Looking around 👀',
          state: 'Not signed in yet',
          startTimestamp: new Date(),
          largeImageKey: 'glowsquid',
          largeImageText: 'Coming not soon™'
        })

        console.log('rpc now active')
      })

      client.login({
        clientId: '795736067675258891'
      })

      this._create()

      ipcMain.on('updatePresence', (_e, presence) => {
        client.setActivity({
          ...prevActivity,
          ...presence
        })

        prevActivity = {
          ...prevActivity,
          ...presence
        }
      }
      )
    })

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!this.allowRecreate) return
    app.on('activate', () => this._recreate())
  }

  _create () {
    this.browserWindow = new BrowserWindow(
      {
        ...this.options,
        webPreferences: {
          ...this.options.webPreferences,
          webSecurity: false, // disabled until modrinth's api is public
          nodeIntegration: true, // allow loading modules via the require () function
          devTools: !process.env.SPECTRON, // disable on e2e test environment
          enableRemoteModule: true
        }
      }
    )

    this.browserWindow.on('closed', () => {
      // Dereference the window object
      this.browserWindow = null
    })

    this._eventEmitter.emit('created')
  }

  _recreate () {
    if (this.browserWindow === null) this._create()
  }

  /**
     * @callback onReadyCallback
     * @param {BrowserWindow}
     */

  /**
     *
     * @param callback {onReadyCallback}
     */
  onCreated (callback) {
    this._eventEmitter.once('created', () => {
      callback(this.browserWindow)
    })
  }

  /**
     *
     * @returns {Promise<BrowserWindow>}
     */
  created () {
    return new Promise(resolve => {
      this._eventEmitter.once('created', () => {
        resolve(this.browserWindow)
      })
    })
  }
}

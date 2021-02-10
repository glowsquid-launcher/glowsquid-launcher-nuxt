import * as path from 'path'
import { remote } from 'electron'
import { Plugin } from '@nuxt/types'

const plugin: Plugin = (_, inject) => {
  inject('$getInstancesPath',
    (instanceName: string) => path.join(remote.app.getPath('userData'), 'instances', instanceName))
}

export default plugin

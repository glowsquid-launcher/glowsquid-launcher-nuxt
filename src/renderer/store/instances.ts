/* eslint-disable max-len */
import { promises as fs, existsSync } from 'fs'
import * as path from 'path'
import { store } from '@/plugins/store'
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { mkdir, rm } from 'shelljs'
import { remote } from 'electron'
import axios from 'axios'
import FabricLoaderVersion from '@/../types/FabricLoaderVersion'
import FabricVersion from '@/../types/FabricVersion'
import UiModule from './ui'
import Modpack from '~/../types/Modpack'
import ModFile from '~/../types/ModFile'

type AddInstanceType = {
  name: string,
  fabricLoaderVersion: FabricLoaderVersion,
  fabricLoader: FabricVersion,
  ram: {
    min: string,
    max: string
  },
  assetRoot?: string
}

@Module({
  name: 'instances',
  stateFactory: true,
  namespaced: true
})
export default class InstancesModule extends VuexModule {
  instances: Modpack[] = store.get('instances', [])
  userData = remote.app.getPath('userData')

  @Mutation
  PUSH_INSTANCE (instance: Modpack) {
    this.instances.push(instance)
    store.set('instances', this.instances)
  }

  @Mutation
  READD_INSTANCES (instances: Modpack[]) {
    this.instances = instances
    store.set('instances', this.instances)
  }

  @Mutation
  PUSH_MOD (mod: ModFile, instance: Modpack) {
    this.instances[this.instances.indexOf(instance)].files.push(mod)
  }

   @Action
  async ADD_INSTANCE ({ name, fabricLoader, fabricLoaderVersion, ram, assetRoot }: AddInstanceType, store: Store<any>) {
    const uiStore = getModule(UiModule, store)
    const version: Modpack = {
      name,
      summary: 'no summary yet',
      description: 'no description yet',
      versionId: '0.0.1',
      releaseDate: new Date().toISOString(),
      formatVersion: 1,
      dependencies: {
        minecraft: fabricLoader.version,
        'fabric-loader': fabricLoaderVersion.version
      },
      files: [],
      extras: {
        memory: ram,
        overrides: {
          assetRoot
        }
      }
    }

    mkdir('-p', path.join(this.userData, 'instances', name, '.minecraft', 'versions', fabricLoader.version + 'fabric'))
    mkdir('-p', path.join(this.userData, 'instances', name, '.minecraft', 'mods'))

    const content = JSON.stringify((await axios.get(`https://fabricmc.net/download/technic?yarn=${fabricLoader.version}${fabricLoaderVersion.separator}${fabricLoaderVersion.build}&loader=${fabricLoaderVersion.version}`)).data)

    await fs.writeFile(
      path.join(this.userData, 'instances', name, 'instance.json'),
      JSON.stringify(version))
    await fs.writeFile(path.join(this.userData, 'instances', name, '.minecraft', 'versions', fabricLoader.version + 'fabric', fabricLoader.version + 'fabric.json'),
      content)

    this.context.commit('PUSH_INSTANCE', version)
    uiStore.TOGGLE_ADD_INSTANCE_MODAL()
  }

  @Action
   async REFRESH_INSTANCES () {
     // fs.stat breaks for some reason
     if (!existsSync(path.join(this.userData, 'instances'))) mkdir('-p', path.join(this.userData, 'instances'))

     const instancePaths = (await fs.readdir(path.join(this.userData, 'instances'), { withFileTypes: true }))
       .filter(dirent => dirent.isDirectory())
       .map(dirent => path.join(this.userData, 'instances', dirent.name, 'instance.json'))

     this.context.commit('READD_INSTANCES', await Promise.all(instancePaths.map(async instancePath =>
       JSON.parse((await fs.readFile(instancePath)).toString('utf-8'))
     )))
   }

  @Action
  async DELETE_INSTANCE (instance: Modpack) {
    const folderToDelete = path.join(this.userData, 'instances', instance.name)
    if (existsSync(folderToDelete)) {
      rm('-rf', folderToDelete)
      this.context.dispatch('REFRESH_INSTANCES')
    }
  }

  // @Action
  // async DOWNLOAD_MOD(mod: ModFile, instance: Modpack) {

  // }
}

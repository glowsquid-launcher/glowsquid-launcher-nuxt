<template>
  <div>
    <article class="ml-4 flex max-h-40 align-center">
      <transition
        name="slide-x-transition"
        appear
        duration="100"
      >
        <div v-if="!leaving" class="w-2/12">
          <v-img
            :src="mod.icon_url"
            max-height="64"
            max-width="64"
            class="rounded-md"
          />
        </div>
      </transition>
      <transition
        name="slide-y-transition"
        appear
        duration="100"
      >
        <div v-if="!leaving" class="w-8/12">
          <h1 class="text-xl text-center mb-2">{{ mod.title }}</h1>
          <h2 class="text-md text-center italic">{{ mod.description }}</h2>
        </div>
      </transition>
      <transition
        name="slide-x-reverse-transition"
        appear
        duration="100"
      >
        <div v-if="!leaving" class="ml-auto flex flex-col w-2/12">
          <v-btn class="mb-2 self-center" color="secondary" :disabled="alreadyInstalled" @click="downloadMod">
            {{ $t('pages.mod.install') }}
          </v-btn>
        </div>
      </transition>
    </article>
    <v-divider class="mt-2 mb-4" />

    <v-tabs v-if="!leaving" color="secondary" class="mt-auto flex flex-grow flex-col">
      <v-tab href="#desc">
        {{ $t('pages.mod.tabs.description') }}
      </v-tab>
      <v-tab href="#mods">
        {{ $t('pages.mod.tabs.versions') }}
      </v-tab>

      <v-tab-item id="desc" key="desc" class="flex-grow">
        <div class="mod-info ma-4">
          <!-- eslint-disable-next-line vue/no-v-html sanitised using DOMPurify -->
          <div v-html="desc" />
        </div>
      </v-tab-item>
      <v-tab-item id="mods" key="mods">
        <v-select
          v-model="versionFilter"
          :items="supportedVersions"
          class="ml-3 mr-3 mt-3"
          label="filter versions"
          clearable
          outlined
        />

        <div
          v-if="!useList"
          class="grid
          sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2
          justify-center mt-4 ml-3"
        >
          <transition
            v-for="(version) in filteredVersions"
            :key="version.id"
            name="slide-x-transition"
            appear
            duration="100"
          >
            <v-hover>
              <template #default="{ hover }">
                <v-card
                  v-if="!leaving"
                  rounded="md"
                  class="version-card"
                  :elevation="hover ? '10' : '0'"
                  color="#1a1a1a"
                >
                  <v-card-title class="mb-2">
                    <p class="text-center w-full">{{ version.name }}</p>
                  </v-card-title>
                  <v-card-subtitle class="text-center">
                    id: {{ version.id }}
                  </v-card-subtitle>
                  <v-card-text class="text-center">
                    for minecraft {{ version.game_versions.join(', ') }}
                  </v-card-text>
                  <v-card-actions>
                    <v-btn block>install</v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-hover>
          </transition>
        </div>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script lang="ts">
import fs from 'fs'
import path from 'path'
import marked from 'marked'
import DOMPurify from 'dompurify'
import { getModule } from 'vuex-module-decorators'
import Vue from 'vue'
import Mod from '../../../../../types/Mod'
import ModVersion from '../../../../../types/ModVersion'
import { typedIpcRenderer } from '../../../../../types/Ipc'
import Modpack from '../../../../../types/Modpack'
import InstancesModule from '~/store/instances'
import UiModule from '~/store/ui'

export default Vue.extend({
  beforeRouteLeave (_, _2, next) {
    this.leaving = true
    setTimeout(() => {
      next()
    }, 100)
  },
  data () {
    return {
      mod: {} as Mod,
      leaving: false,
      desc: '',
      instance: getModule(InstancesModule, this.$store).instances.find(v => v.name === this.$route.params.id),
      uiStore: getModule(UiModule, this.$store),
      // non filtered, for caching purposes
      versions: [] as ModVersion[],
      versionFilter: '',
      supportedVersions: [] as string[],
      filteredVersions: [] as ModVersion[],
      alreadyInstalled: false
    }
  },
  async fetch () {
    const instance = getModule(InstancesModule, this.$store).instances.find(v => v.name === this.$route.params.id)
    if (!instance) return

    this.mod = await this.$axios.$get(`https://api.modrinth.com/api/v1/mod/${this.$route.params.modid}`)

    this.alreadyInstalled = await (async () => {
      const instanceJsonPath = path.join(
        await typedIpcRenderer.invoke('GetPath', 'userData'),
        'instances', instance.name, 'instance.json'
      )

      const instanceJson: Modpack = JSON.parse(fs.readFileSync(instanceJsonPath).toString())
      return instanceJson.files.some(file => file.id === this.mod.id)
    })()

    this.versions = await this.$axios.$get(`https://api.modrinth.com/api/v1/mod/${this.$route.params.modid}/version`)
    this.filteredVersions = this.versions

    // we use spread syntax with a set to avoid duplicate minecraft versions
    this.supportedVersions = [...new Set(this.versions.map(val => val.game_versions).flat())]

    // turn markdown -> html and purify/sanitize it
    this.desc = marked(await this.$axios.$get(this.mod?.body_url), {
      sanitizer: html => DOMPurify.sanitize(html)
    })
  },
  computed: {
    useList (): boolean {
      return this.uiStore.listMode
    }
  },
  watch: {
    versionFilter () {
      // when the filter updates actually filter results
      // in case filter is empty we just set it to all versions
      this.filteredVersions = this.versionFilter

        ? this.versions.filter(v => v.game_versions.includes(this.versionFilter))
        : this.versions
    }
  },
  methods: {
    async downloadMod () {
      const modVersions =
        // eslint-disable-next-line max-len
        (await this.$axios.$get<ModVersion[]>(`https://api.modrinth.com/api/v1/mod/${this.mod.mod_id.replace('local-', '')}/version`))

      const filteredVersions = modVersions.filter(v => v.game_versions.some(gameVersion => {
        if (gameVersion === this.instance!!.dependencies.minecraft) return true
        // we do the instance version instead as we know it's always 3 `.`s
        const gameVerNoMinor = this.instance!!.dependencies.minecraft.split('.')
        gameVerNoMinor.pop()
        return gameVersion === gameVerNoMinor.join('.')
      }))

      await this.instanceStore.DOWNLOAD_MOD({
        instance: this.instance!!,
        mod: filteredVersions[0].files[0],
        deps: filteredVersions[0].dependencies,
        id: modVersions[0].mod_id
      })
    }
  }
})
</script>

<style lang="stylus">
.mod-info div {
  img {
    border: 3px solid var(--v-primary-base)
    border-radius: 15px
    paddng: 3px
  }
  h2 {
    font-size: 1.5rem
  }
  h1 {
    font-size: 2rem
  }
  li {
    margin-left: 8px
    &:before {
      content: "- "
    }
  }
}

.version-card {
  position: relative
  padding-bottom: 5px !important
}
</style>

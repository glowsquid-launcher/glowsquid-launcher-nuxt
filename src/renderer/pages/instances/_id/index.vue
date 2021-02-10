<template>
  <div v-if="instance" class="flex flex-col">
    <article class="ml-4 flex max-h-40">
      <transition
        name="slide-y-transition"
        appear
        duration="100"
      >
        <div v-if="!leaving" class="w-10/12">
          <h1 class="text-xl text-center mb-2">{{ instance.name }}</h1>
          <h2 class="text-md text-center italic">{{ instance.summary }}</h2>
          <p v-if="downloadState" class="text-sm text-center">
            {{ $t('pages.instance.status', {
              download: downloadState.name,
              type: downloadState.type,
              percent: Math.round(downloadState.current / downloadState.total * 100)
            }) }}
          </p>
        </div>
      </transition>
      <transition
        name="slide-x-reverse-transition"
        appear
        duration="100"
      >
        <div v-if="!leaving" class="ml-auto flex flex-col w-2/12">
          <v-btn class="mb-2" color="secondary" @click="launch()">Launch</v-btn>
          <v-btn
            class="mb-2"
            color="accent"
            @click="$router.push({ path: localePath(`/instances/${$route.params.id}/mods`) })"
          >
            {{ $t('pages.instance.addMods') }}
          </v-btn>
          <v-btn color="secondary align-self-center">{{ $t('pages.instance.settings') }}</v-btn>
        </div>
      </transition>
    </article>
    <transition name="fade-transition" appear duration="100">
      <v-tabs v-if="!leaving" color="secondary" class="mt-4 mt-auto flex flex-grow flex-col">
        <v-tab href="#desc">
          {{ $t('pages.instance.tabs.description') }}
        </v-tab>
        <v-tab href="#mods">
          {{ $t('pages.instance.tabs.mods') }}
        </v-tab>

        <v-tab-item id="desc" key="desc" class="flex-grow">
          <!-- eslint-disable-next-line vue/no-v-html we sanitised this using DOMPurify so we know its safe-->
          <div class="ml-3" v-html="desc" />
        </v-tab-item>
        <v-tab-item id="mods" key="mods">
          yes
        </v-tab-item>
      </v-tabs>
    </transition>
  </div>
</template>

<script lang="ts">
import marked from 'marked'
import DOMPurify from 'dompurify'
import { getModule } from 'vuex-module-decorators'
import launch from '~/utils/launch'
import DownloadProgress from '~/../types/DownloadProgress'
import InstancesModule from '~/store/instances'

export default {
  beforeRouteLeave (_, _2, next) {
    this.leaving = true
    setTimeout(() => {
      next()
    }, 100)
  },
  data () {
    return {
      instance: getModule(InstancesModule, this.$store).instances.find(v => v.name === this.$route.params.id),
      leaving: false,
      downloadState: null as DownloadProgress | null
    }
  },
  computed: {
    desc () {
      return marked(this.instance?.description, {
        sanitize: true,
        sanitizer: html => DOMPurify.sanitize(html)
      })
    }
  },
  methods: {
    async launch () {
      const client = await launch(this.instance ? this.instance : null, this.$store)
      client?.on('download-status', e => { this.downloadState = e })
      client?.on('data', e => console.log(e))
    }
  }
}
</script>

<style lang="stylus">
.v-tabs .v-tabs-items {
  height: 100%
}
</style>

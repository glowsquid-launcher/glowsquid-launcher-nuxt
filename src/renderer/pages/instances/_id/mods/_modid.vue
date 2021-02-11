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
          <v-btn class="mb-2 self-center" color="secondary">{{ $t('pages.mod.install') }}</v-btn>
        </div>
      </transition>
    </article>
    <v-divider class="mt-2 mb-4" />

    <v-tabs v-if="!leaving" color="secondary" class="mt-4 mt-auto flex flex-grow flex-col">
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
      <v-tab-item id="mods" key="mods" />
    </v-tabs>
  </div>
</template>

<script lang="ts">
import marked from 'marked'
import DOMPurify from 'dompurify'
import { getModule } from 'vuex-module-decorators'
import Mod from '../../../../../types/Mod'
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
      mod: {} as Mod,
      leaving: false,
      desc: '',
      instance: getModule(InstancesModule, this.$store).instances.find(v => v.name === this.$route.params.id)
    }
  },
  async fetch () {
    this.mod = await this.$axios.$get(`https://api.modrinth.com/api/v1/mod/${this.$route.params.modid}`) as Mod
    this.desc = marked(await this.$axios.$get(this.mod?.body_url), {
      sanitizer: html => DOMPurify.sanitize(html)
    })
  }
}
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
</style>
</style>

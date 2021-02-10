<template>
  <div>
    <transition name="slide-y-transition" appear>
      <v-text-field
        v-if="!leaving"
        v-model="searchQuery"
        background-color="#2b2b2b"
        :placeholder="$t('pages.mods.search')"
        class="mr-4 ml-4 mt-2 sticky z-20 elevation"
        style="top: 60px;"
        :hint="$t('pages.mods.hint')"
        solo
        dense
      >
        <template #prepend-inner>
          <v-icon>
            mdi-magnify
          </v-icon>
        </template>
      </v-text-field>
    </transition>
    <div
      class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2"
    >
      <div v-for="mod in modList.hits" :key="mod.mod_id">
        <v-card height="100%" class="card-outter">
          <v-card-title>
            <transition name="slide-y-transition" appear duration="100">
              <h1 v-if="!leaving" class="flex flex-row mb-2">
                <v-img :max-height="32" :max-width="32" :src="mod.icon_url" class="mr-3 rounded-sm" />
                <p class="h-full ma-0 align-middle">{{ mod.title }}</p>
              </h1>
            </transition>
          </v-card-title>
          <v-card-subtitle>
            <transition name="slide-x-transition" appear duration="100">
              <p v-if="!leaving">by {{ mod.author }}</p>
            </transition>
          </v-card-subtitle>
          <v-card-text>
            <transition name="slide-x-transition" appear duration="100">
              <p v-if="!leaving">{{ mod.description }}</p>
            </transition>
          </v-card-text>
          <v-card-actions class="card-actions w-full">
            <transition name="slide-y-reverse-transition" appear duration="100">
              <div
                v-if="!leaving"
                class="grid-cols-2 gap-1 justify-center w-full"
                style="display: grid !important; "
              >
                <v-btn block @click="$router.push({
                  path: localePath(`/instances/${$route.params.id}/mods/${mod.mod_id.replace('local-', '') }`)
                })"
                >
                  {{ $t('pages.mods.about') }}
                </v-btn>
                <v-btn block>{{ $t('pages.mods.install') }}</v-btn>
              </div>
            </transition>
          </v-card-actions>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { getModule } from 'vuex-module-decorators'
import ModList from '../../../../../types/ModList'
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
      searchQuery: '',
      leaving: false,
      modList: {} as ModList
    }
  },
  async fetch () {
    // eslint-disable-next-line max-len
    this.modList = await this.$axios.$get(`https://api.modrinth.com/api/v1/mod?filters=categories=fabric&versions=${this.instance?.dependencies.minecraft}`)
  },
  watch: {
    async searchQuery (newQuery) {
      // eslint-disable-next-line max-len
      this.modList = await this.$axios.$get(`https://api.modrinth.com/api/v1/mod?${newQuery ? `query=${newQuery}` : ''}&filters=categories=fabric&versions=${this.instance?.dependencies.minecraft}`)
    }
  }
}

</script>

<style lang="stylus">
.card-outter {
  position: relative
  padding-bottom: 50px
}
.card-actions {
  position: absolute
  bottom: 0
}
</style>

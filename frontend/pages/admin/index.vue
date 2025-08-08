<template>
  <v-container>
    <v-card>
      <v-card-title>Admin Resources</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="resource in resources" :key="resource">
            <v-list-item-content>
              <v-list-item-title>
                <nuxt-link :to="`/admin/${resource}`">{{ resource }}</nuxt-link>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { Resource } from '~/types/resource';

  const resources = Object.values(Resource)
</script>
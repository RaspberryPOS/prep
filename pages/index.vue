<template>
  <v-container fluid>
    <VueHorizontal
      v-if="ordersOldToNew.length > 0"
      scroll
      class="ml-5 mr-5 horizontal"
    >
      <v-col
        v-for="(id, index) in ordersOldToNew"
        :key="index"
        cols="12"
        md="5"
      >
        <PrepCard :order="orders[id]" />
      </v-col>
    </VueHorizontal>
    <v-row v-else>
      <v-col class="text-h2 mt-7 primary--text text-center">
        <div>No orders :(</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'PrepPage',
  data() {
    return {}
  },
  head: {
    title: 'Prep',
  },
  computed: {
    orders() {
      return this.$store.state.orders.orders
    },
    ordersOldToNew() {
      return Object.keys(this.orders).sort(
        (a, b) => this.orders[a].createdAt - this.orders[b].createdAt
      )
    },
  },
}
</script>

<style scoped>
.horizontal >>> .v-hl-container {
  /* For firefox only */
  scrollbar-width: thin;
  scrollbar-color: grey;
}

.horizontal >>> .v-hl-container::-webkit-scrollbar {
  height: 16px;
  width: 16px;
  background: transparent;
}

.horizontal >>> .v-hl-container::-webkit-scrollbar-track {
  border-radius: 4px;
}

.horizontal >>> .v-hl-container::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background: grey;
}
</style>

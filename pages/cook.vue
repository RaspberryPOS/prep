<template>
  <v-container fluid>
    <VueHorizontal v-if="orders.length > 0" scroll class="ml-5 mr-5 horizontal">
      <v-col v-for="order in orders" :key="order.id" cols="12" md="5">
        <CookCard :order="order" />
      </v-col>
    </VueHorizontal>
    <v-row v-else>
      <v-col class="text-h2 mt-7 primary--text text-center">
        <div>Nothing to Cook</div>
        <div v-if="Object.keys($store.state.orders.orders).length > 0">
          There are orders to Prepare
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CookPage',
  data() {
    return {}
  },
  head: {
    title: 'Cook',
  },
  computed: {
    orders() {
      return Object.values(this.$store.state.orders.orders).filter((order) =>
        order.orderItems.some((item) => item.food.mustBeFired)
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

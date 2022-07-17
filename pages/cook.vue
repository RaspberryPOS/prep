<template>
  <v-container fluid>
    <VueHorizontal scroll class="ml-5 mr-5 horizontal">
      <v-col v-for="order in orders" :key="order.id" cols="12" md="5">
        <CookCard :order="order" />
      </v-col>
    </VueHorizontal>
  </v-container>
</template>

<script>
export default {
  name: 'CookPage',
  data() {
    return {}
  },
  computed: {
    orders() {
      return this.$store.state.orders.orders.filter((order) =>
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

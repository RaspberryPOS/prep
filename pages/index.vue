<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card v-for="order in orders" :key="order.id">
        {{ order.orderNumber }}
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'PrepPage',
  computed: {
    orders() {
      return this.$store.state.orders.orders
    },
  },
}
</script>

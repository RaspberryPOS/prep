<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      clipped
      fixed
      app
      disable-resize-watcher
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar clipped-left fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-order-numeric-ascending</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-layout>
        <Nuxt />
      </v-layout>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      right
      fixed
      touchless
      disable-resize-watcher
      app
      dark
      width="400"
      fill-height
    >
      <v-layout column class="fill-height">
        <v-flex class="flex shrink">
          <v-list subheader two-line class="mt-0 mb-0 pb-0">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text-h6"
                  >Item Totals</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-flex>

        <!-- List of Item totals -->
        <v-flex class="flex overflow-auto grey darken-4">
          <v-list subheader class="mt-1">
            <v-list-item v-for="item in orderItemTotals" :key="item.id">
              <v-list-item-action class="mr-4">
                <v-badge
                  v-if="item.ready > 0"
                  color="green"
                  :content="item.ready"
                  overlap
                  bordered
                >
                  <v-avatar color="primary" size="36">
                    <span class="white--text text-h5">{{
                      item.total - item.ready
                    }}</span>
                  </v-avatar>
                </v-badge>
                <v-avatar v-else color="primary" size="36">
                  <span class="white--text text-h5">{{ item.total }}</span>
                </v-avatar>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item-content>
              <span v-if="item.mustBeFired">
                <v-list-item-avatar class="mr-0" color="error" size="28">
                  <span class="white--text text-h6">{{ item.waiting }}</span>
                </v-list-item-avatar>
                <v-list-item-avatar color="warning" size="28">
                  <span class="white--text text-h6">{{ item.firing }}</span>
                </v-list-item-avatar>
                <v-list-item-avatar class="ml-0" color="success" size="28">
                  <span class="white--text text-h6">{{ item.fired }}</span>
                </v-list-item-avatar>
              </span>
            </v-list-item>
          </v-list>
        </v-flex>
      </v-layout>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      drawer: false,
      items: [
        {
          icon: 'mdi-food',
          title: 'Prep',
          to: '/',
        },
        {
          icon: 'mdi-fire',
          title: 'Cook',
          to: '/cook',
        },
      ],
      rightDrawer: false,
      title: 'Prep',
    }
  },
  head: {
    title: 'Cook',
  },
  computed: {
    currentRoute() {
      return this.$route.name
    },
    orders() {
      return this.$store.state.orders.orders
    },
    orderItems() {
      return this.$store.state.orders.orderItems
    },
    orderItemTotals() {
      // For each item up, calculates how many of each there are
      const foodItems = {}
      this.orderItems.forEach((item) => {
        if (!(item.food.id in foodItems))
          foodItems[item.food.id] = {
            id: item.food.id,
            name: item.food.name,
            mustBeFired: item.food.mustBeFired,
            total: 0,
            waiting: 0,
            firing: 0,
            fired: 0,
            ready: 0,
          }

        foodItems[item.food.id].total++
        if (item.ready) foodItems[item.food.id].ready++
        else if (item.fired) foodItems[item.food.id].fired++
        else if (item.firing) foodItems[item.food.id].firing++
        else foodItems[item.food.id].waiting++
      })
      // Sort by name
      if (this.currentRoute === 'cook')
        return Object.values(foodItems).sort(
          (a, b) =>
            +!a.mustBeFired - +!b.mustBeFired || a.name.localeCompare(b.name)
        )
      // Sort things to be fired up top, then by name
      else
        return Object.values(foodItems).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
    },
  },
  async created() {
    await this.$store.dispatch('orders/getOrders')
  },
}
</script>

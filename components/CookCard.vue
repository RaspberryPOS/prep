<template>
  <v-card class="flex d-flex flex-column">
    <v-card-text :class="[orderStatusColor, 'mb-0 white--text']">
      <v-row>
        <v-col col="11">
          <h3>Order</h3>
          <div class="text-h3 white--text mb-0 pb-0">
            {{ order.orderNumber }}
          </div>
        </v-col>
        <v-col col="1" align="right">
          <div class="font-weight-light">Order Age</div>
          <span class="text-h4 font-weight-bold">
            <code>{{ orderAgeString }}</code>
          </span>
        </v-col>
      </v-row>
    </v-card-text>

    <v-list
      class="flex d-flex flex-column pa-0 ma-0"
      style="height: 57vh; overflow-y: auto"
      two-line
    >
      <v-container
        v-for="item in orderItemList"
        :key="item.id"
        class="pa-0 ma-0"
      >
        <v-list-item
          :class="[
            'lighten-4',
            item.fired
              ? 'green'
              : item.firing
              ? 'orange'
              : item.food.mustBeFired
              ? 'error'
              : 'grey',
          ]"
        >
          <v-list-item-action v-if="item.food.mustBeFired" class="mr-1">
            <span class="text-h5 font-weight-bold">
              <span
                v-if="item.fired && item.firedTime > item.firingTime"
                class="success--text"
                ><code>{{
                  timeSinceAsString(item.firingTime, item.firedTime)
                }}</code></span
              >
              <span
                v-else-if="item.firing && item.firingTime"
                class="warning--text"
                ><code>{{ timeSinceAsString(item.firingTime) }}</code></span
              >
              <span
                v-else
                :class="
                  item.fired
                    ? 'success--text'
                    : item.firing
                    ? 'warning--text'
                    : ''
                "
                ><code>00:00</code></span
              >
            </span>
          </v-list-item-action>
          <v-list-item-action v-else class="mr-1">
            <span class="text-h5">
              <code>--:--</code>
            </span>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title
              :class="[
                'font-weight-medium',
                item.food.mustBeFired ? 'primary--text' : 'grey--text',
              ]"
              >{{ item.food.name }}</v-list-item-title
            >
            <div v-if="item.options">
              <div v-for="opt in item.options" :key="opt.id">
                <v-list-item-subtitle class="font-weight-medium">{{
                  opt.option.name
                }}</v-list-item-subtitle>
                <v-list-item-subtitle
                  v-if="opt.optionPrep?.length > 0"
                  class="d-flex text-wrap"
                  >{{
                    opt.optionPrep
                      .map((i) => `${i.quantity}x ${i.name}`)
                      .join(', ')
                  }}</v-list-item-subtitle
                >
                <v-list-item-subtitle
                  v-if="opt.optionFood?.length > 0"
                  class="d-flex text-wrap"
                  >{{
                    opt.optionFood
                      .map((i) => `${i.quantity}x ${i.food.name}`)
                      .join(', ')
                  }}</v-list-item-subtitle
                >
              </div>
            </div>
            <div v-if="item.foodNotes">
              <v-list-item-subtitle class="font-weight-medium orange--text"
                >Special Requests</v-list-item-subtitle
              >
              <v-list-item-subtitle class="d-flex text-wrap">{{
                item.foodNotes
              }}</v-list-item-subtitle>
            </div>
          </v-list-item-content>
          <v-list-item-action v-if="item.food.mustBeFired">
            <v-btn
              :color="item.firing || item.fired ? 'warning' : 'primary'"
              fab
              outlined
              icon
              @click="startFire(item.id)"
            >
              <v-icon v-if="item.firing || item.fired">mdi-replay</v-icon>
              <v-icon v-else>mdi-play</v-icon>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action v-if="item.food.mustBeFired">
            <v-btn
              color="success"
              fab
              depressed
              :disabled="item.fired"
              @click="setFired(item.id)"
            >
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-divider />
      </v-container>
    </v-list>

    <v-divider />
    <v-card-actions>
      <v-btn x-large block color="primary" @click="startFireAll">
        <v-icon>mdi-play</v-icon>Fire All
      </v-btn>
    </v-card-actions>
    <v-card-actions>
      <v-btn
        x-large
        block
        color="success"
        :disabled="
          orderItemList.filter((i) => i.food.mustBeFired && !i.fired).length ===
          0
        "
        @click="setFiredAll"
      >
        <v-icon>mdi-check</v-icon>All Cooked
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Keep track of current time to enable show time since order
      orderAgeString: 0,
      orderAgeSeconds: 0,
    }
  },
  computed: {
    orderStatusColor() {
      return this.orderAgeSeconds < 60 * 2
        ? 'success'
        : this.orderAgeSeconds < 60 * 4.5
        ? 'warning'
        : 'error'
    },
    // Generates an ordered list to show in the order card -- by category then any order items
    orderItemList() {
      return JSON.parse(JSON.stringify(this.order.orderItems)).sort(
        (a, b) =>
          +!a.food.mustBeFired - +!b.food.mustBeFired ||
          a.food.name.localeCompare(b.food.name)
      )
    },
  },
  mounted() {
    // On mount, start timer which updates data.now every second
    this.updateOrderAge()
    setInterval(this.updateOrderAge.bind(this), 1000)
  },
  methods: {
    updateOrderAge() {
      const duration = this.$moment.duration(
        this.$moment().diff(this.$moment(this.order.createdAt))
      )
      const hours = parseInt(duration.asHours())
      const minutes = parseInt(duration.asMinutes()) % 60
      const seconds = parseInt(duration.asSeconds()) % 60
      this.orderAgeSeconds = duration.asSeconds()
      this.orderAgeString = `${
        hours > 0 ? String(hours).padStart(2, '0') + ':' : ''
      }${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    startFire(id) {
      this.$store.dispatch('orders/setItemFiring', {
        id,
        time: new Date(),
        status: true,
      })
      if (this.orderItemList.filter((item) => item.id === id)[0].fired)
        this.$store.dispatch('orders/setItemFired', {
          id,
          status: false,
          time: null,
        })
    },
    startFireAll() {
      const newTime = new Date()
      this.orderItemList
        .filter((i) => i.food.mustBeFired)
        .forEach((item) => {
          this.$store.dispatch('orders/setItemFiring', {
            id: item.id,
            time: newTime,
            status: true,
          })
        })
      this.orderItemList
        .filter((i) => i.food.mustBeFired && i.fired)
        .forEach((item) => {
          this.$store.dispatch('orders/setItemFired', {
            id: item.id,
            time: null,
            status: false,
          })
        })
    },
    setFired(id) {
      this.$store.dispatch('orders/setItemFired', {
        id,
        time: new Date(),
        status: true,
      })
    },
    setFiredAll() {
      const time = new Date()
      this.orderItemList
        .filter((i) => i.food.mustBeFired && !i.fired)
        .forEach((item) => {
          this.$store.dispatch('orders/setItemFired', {
            id: item.id,
            time,
            status: true,
          })
        })
    },
    timeSinceAsString(startTime, endTime = new Date()) {
      const duration = this.$moment.duration(
        this.$moment(endTime).diff(this.$moment(startTime))
      )
      const minutes = parseInt(duration.asMinutes()) % 60
      const seconds = parseInt(duration.asSeconds()) % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
        2,
        '0'
      )}`
    },
  },
}
</script>

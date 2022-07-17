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

    <v-list two-line class="flex pt-0" style="height: 63vh; overflow-y: auto">
      <v-list-item-group v-model="orderItemReadyStatus" multiple>
        <v-container
          v-for="(listItem, orderListIndex) in orderList"
          :key="orderListIndex"
          class="pa-0 ma-0"
        >
          <!-- Show Category Header -->
          <v-subheader
            v-if="listItem.type === 'Category'"
            class="grey lighten-2 text-h6"
            >{{ listItem.text }}</v-subheader
          >

          <!-- Show MenuItem -->
          <v-container v-if="listItem.type === 'MenuItem'" class="pa-0 ma-0">
            <v-subheader v-if="listItem.orderItems.length > 1">{{
              listItem.name
            }}</v-subheader>
            <v-list-item
              v-for="subListItem in listItem.orderItems"
              :key="subListItem.id"
              :value="subListItem.id"
            >
              <template #default="{ active }">
                <v-list-item-action>
                  <v-checkbox :input-value="active"></v-checkbox>
                </v-list-item-action>

                <v-list-item-content>
                  <v-list-item-title>{{
                    subListItem.food.name
                  }}</v-list-item-title>
                  <div v-if="subListItem.options">
                    <div v-for="(opt, key) in subListItem.options" :key="key">
                      <v-list-item-subtitle class="font-weight-medium">{{
                        opt.option.name
                      }}</v-list-item-subtitle>
                      <v-list-item-subtitle
                        v-if="opt.optionPrep.length > 0"
                        class="d-flex text-wrap"
                        >{{
                          opt.optionPrep
                            .map(
                              (i) =>
                                `${i.quantity > 1 ? i.quantity + 'x ' : ''}${
                                  i.name
                                }`
                            )
                            .join(', ')
                        }}</v-list-item-subtitle
                      >
                      <v-list-item-subtitle
                        v-if="opt.optionFood.length > 0"
                        class="d-flex text-wrap"
                        >{{
                          opt.optionFood
                            .map(
                              (i) =>
                                `${i.quantity > 1 ? i.quantity + 'x ' : ''}${
                                  i.food.name
                                }`
                            )
                            .join(', ')
                        }}</v-list-item-subtitle
                      >
                    </div>
                  </div>
                  <div v-if="subListItem.foodNotes">
                    <v-list-item-subtitle
                      class="font-weight-medium orange--text"
                      >Special Requests</v-list-item-subtitle
                    >
                    <v-list-item-subtitle class="d-flex text-wrap">{{
                      subListItem.foodNotes
                    }}</v-list-item-subtitle>
                  </div>
                </v-list-item-content>
                <v-list-item-action v-if="subListItem.food.mustBeFired">
                  <v-icon
                    :color="
                      subListItem.fired
                        ? 'success'
                        : subListItem.firing
                        ? 'warning'
                        : 'grey'
                    "
                  >
                    mdi-fire-circle
                  </v-icon>
                </v-list-item-action>
              </template>
            </v-list-item>
          </v-container>

          <!-- Show individual Foods -->
          <v-list-item
            v-if="listItem.type === 'Food'"
            :value="listItem.orderItem.id"
          >
            <template #default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active"></v-checkbox>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>{{
                  listItem.orderItem.food.name
                }}</v-list-item-title>
                <div v-if="listItem.orderItem.options">
                  <div
                    v-for="(opt, key) in listItem.orderItem.options"
                    :key="key"
                  >
                    <v-list-item-subtitle class="font-weight-medium">{{
                      opt.option.name
                    }}</v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-if="opt.optionPrep.length > 0"
                      class="d-flex text-wrap"
                      >{{
                        opt.optionPrep
                          .map(
                            (i) =>
                              `${i.quantity > 1 ? i.quantity + 'x ' : ''}${
                                i.name
                              }`
                          )
                          .join(', ')
                      }}</v-list-item-subtitle
                    >
                    <v-list-item-subtitle
                      v-if="opt.optionFood.length > 0"
                      class="d-flex text-wrap"
                      >{{
                        opt.optionFood
                          .map(
                            (i) =>
                              `${i.quantity > 1 ? i.quantity + 'x ' : ''}${
                                i.food.name
                              }`
                          )
                          .join(', ')
                      }}</v-list-item-subtitle
                    >
                  </div>
                </div>
                <div v-if="listItem.orderItem.foodNotes">
                  <v-list-item-subtitle class="font-weight-medium orange--text"
                    >Special Requests</v-list-item-subtitle
                  >
                  <v-list-item-subtitle class="d-flex text-wrap">{{
                    listItem.orderItem.foodNotes
                  }}</v-list-item-subtitle>
                </div>
              </v-list-item-content>
              <v-list-item-action v-if="listItem.orderItem.food.mustBeFired">
                <v-icon
                  :color="
                    listItem.orderItem.fired
                      ? 'success'
                      : listItem.orderItem.firing
                      ? 'warning'
                      : 'grey'
                  "
                >
                  mdi-fire-circle
                </v-icon>
              </v-list-item-action>
            </template>
          </v-list-item>

          <v-divider />
        </v-container>
      </v-list-item-group>
    </v-list>

    <v-divider />

    <v-card-actions>
      <v-btn
        x-large
        block
        :color="orderComplete ? 'success' : 'primary'"
        @click="completeOrder"
        >Complete Order</v-btn
      >
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
    // Generates an ordered list to show in the order card -- by category then any order items
    orderList() {
      let list = []
      // Iterate by sorted categories
      for (const category of Object.keys(this.order.categoryMapping).sort()) {
        // Add category header obj
        list.push({ type: 'Category', text: category })

        // Get all OrderItems in the category and process MenuItems as a group and Foods; sort
        const categoryOrderItems = [] // Hold the sor
        const foundIdsPartOfMenuItem = []
        for (const orderId of this.order.categoryMapping[category]) {
          // Check if we already dealt with this item as part of a MenuItem and skip it
          if (foundIdsPartOfMenuItem.includes(orderId)) continue

          // Check if orderId is part of a MenuItem
          const menuItemHash = this.order.orderToMenuItemHashMap[orderId]
          if (menuItemHash) {
            // Get the MenuItems -> orderItemIds
            const listItem = {
              type: 'MenuItem',
              name: this.order.menuItemMapping[menuItemHash].menuItem.name,
              orderItems: [],
            }
            // Add each actual OrderItem into the orderItems array
            for (const i of this.order.menuItemMapping[menuItemHash]
              .orderItemIds) {
              // remember that we've now processed this orderId
              foundIdsPartOfMenuItem.push(i)
              // Get the index of the OrderItem
              const orderItemIndex = this.order.orderIdIndex[i]
              // Get the actual OrderItem and put into listItem
              listItem.orderItems.push(this.order.orderItems[orderItemIndex])
            }
            // Sort orderItems by name
            listItem.orderItems.sort((a, b) =>
              a.food.name > b.food.name ? 1 : -1
            )
            // Push the complete MenuItem to the Category Order ITems
            categoryOrderItems.push(listItem)
          }
          // orderId a standalone Food, add
          else {
            // Remember that we've now processed this orderId
            foundIdsPartOfMenuItem.push(orderId)
            // Get the index of the OrderItem
            const orderItemIndex = this.order.orderIdIndex[orderId]
            // Get the actual OrderItem and put into listItem
            categoryOrderItems.push({
              type: 'Food',
              name: this.order.orderItems[orderItemIndex].food.name,
              orderItem: this.order.orderItems[orderItemIndex],
            })
          }
        }
        // Sort MenuItems/Foods in Category by name
        categoryOrderItems.sort((a, b) => (a.name > b.name ? 1 : -1))
        // Add to list
        list = list.concat(categoryOrderItems)
      }
      return list
    },
    orderStatusColor() {
      return this.orderAgeSeconds < 60 * 2
        ? 'success'
        : this.orderAgeSeconds < 60 * 4.5
        ? 'warning'
        : 'error'
    },
    orderComplete() {
      return this.order.orderItems.every((element) => element.ready === true)
    },
    orderItemReadyStatus: {
      get() {
        return this.order.orderItems
          .filter((orderItem) => orderItem.ready)
          .map((orderItem) => orderItem.id)
      },
      async set(newReadyList) {
        // Find the difference
        const oldReadyList = this.order.orderItems
          .filter((orderItem) => orderItem.ready)
          .map((orderItem) => orderItem.id)
        const itemsMarkedNotReady = oldReadyList.filter(
          (x) => !newReadyList.includes(x)
        )
        const itemsMarkedReady = newReadyList.filter(
          (x) => !oldReadyList.includes(x)
        )
        // Dispatch changes to make OrderItems not ready
        if (itemsMarkedNotReady.length > 0) {
          await Promise.all(
            itemsMarkedNotReady.map(async (orderItemId) => {
              await this.$store.dispatch('orders/changeOrderItemStatus', {
                orderItemId,
                readyStatus: false,
              })
            })
          )
        }
        // Dispatch changes to make OrderItems ready
        if (itemsMarkedReady.length > 0) {
          await Promise.all(
            itemsMarkedReady.map(async (orderItemId) => {
              await this.$store.dispatch('orders/changeOrderItemStatus', {
                orderItemId,
                readyStatus: true,
              })
            })
          )
        }
      },
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
    async completeOrder() {
      await this.$store.dispatch('orders/completeOrder', this.order.id)
    },
  },
}
</script>

export const state = () => ({
  orders: [],
  orderItems: [],
  orderItemCook: {}, // For keeping track of details about the cook of an item (when firing start), not sent to server
  orderItemCooked: {}, // For keeping track of details about the cook of an item (when fired), not sent to server
})

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  SET_ORDERITEMS(state, orderItems) {
    state.orderItems = orderItems
  },
  SET_ORDERITEM_COOK(state, { id, time }) {
    state.orderItemCook[id] = time
    delete state.orderItemCooked[id] // Delete "Cooked" time if there
  },
  SET_ORDERITEM_COOKED(state, { id, time }) {
    state.orderItemCooked[id] = time
  },
  CHANGE_ORDERITEM_STATUS(state, { orderId, orderItemId, key, value }) {
    // Find OrderItem in orders[] and change
    state.orders
      .filter((order) => order.id === orderId)[0]
      .orderItems.filter((item) => item.id === orderItemId)[0][key] = value
    // Find OrderItem in orderItems[] and change
    state.orderItems.filter((item) => item.id === orderItemId)[0][key] = value
  },
}

export const actions = {
  async getOrders({ commit }) {
    // Get the incomplete (complete == false) orders from the API
    const res = await this.$api.order.incomplete()

    if (res.status === 200 && res.data) {
      const orderItems = []
      // Parse order data and process attributes
      // Extract OrderItems
      res.data.forEach((order) => {
        order.orderNumber = String(order.orderNumber).padStart(3, '0')
        order.createdAt = new Date(order.createdAt)

        // Process OrderItems
        const items = order.orderItems.map((item) => {
          const itemTmp = {
            orderId: order.id,
            orderNumber: order.orderNumber,
            ...item,
          }

          // simplifiy options
          const optionsTemp = {}
          for (const option of item.options) {
            // Add quantity to optionFood/optionPrep
            if (option.optionFood) option.optionFood.quantity = option.quantity
            if (option.optionPrep) option.optionPrep.quantity = option.quantity

            // Check if Option ID already in new Options Object
            if (option.option.id in optionsTemp) {
              // Add new optionFood/optionPrep and sort by name
              if (option.optionFood)
                optionsTemp[option.option.id].optionFood.push(option.optionFood)
              if (option.optionPrep)
                optionsTemp[option.option.id].optionPrep.push(option.optionPrep)
              // Sort by name
              optionsTemp[option.option.id].optionFood.sort((a, b) =>
                a.food.name > b.food.name ? 1 : -1
              )
              optionsTemp[option.option.id].optionPrep.sort((a, b) =>
                a.name > b.name ? 1 : -1
              )
            } else {
              // Create new object to represent options
              optionsTemp[option.option.id] = {
                option: option.option,
                optionFood: [],
                optionPrep: [],
              }
              if (option.optionFood)
                optionsTemp[option.option.id].optionFood.push(option.optionFood)
              if (option.optionPrep)
                optionsTemp[option.option.id].optionPrep.push(option.optionPrep)
            }
          }
          item.options = optionsTemp

          return itemTmp
        })
        // Sort by name
        items.sort((a, b) => a.food.name.localeCompare(b.food.name))
        // Add to running array
        orderItems.push(...items)
      })

      // Sort
      res.data.sort((a, b) => a.createdAt - b.createdAt)
      commit('SET_ORDERS', res.data)
      commit('SET_ORDERITEMS', orderItems)
    } else {
      alert("Couldn't load Orders, refresh the page and try again.")
    }
  },
  async setItemFiring({ commit }, { id, time, status }) {
    commit('SET_ORDERITEM_COOK', { id, time })
    // Set to cooking on backend
    const res = await this.$api.orderItem.setOrderItemFiringStatus(
      id,
      status,
      time
    )
    commit('CHANGE_ORDERITEM_STATUS', {
      orderId: res.data.orderId,
      orderItemId: res.data.id,
      key: 'firing',
      value: status,
    })
    commit('CHANGE_ORDERITEM_STATUS', {
      orderId: res.data.orderId,
      orderItemId: res.data.id,
      key: 'firingTime',
      value: time,
    })
  },
  async setItemFired({ commit }, { id, time, status }) {
    commit('SET_ORDERITEM_COOKED', { id, time })
    // Set to cooking on backend
    const res = await this.$api.orderItem.setOrderItemFiredStatus(
      id,
      status,
      time
    )
    commit('CHANGE_ORDERITEM_STATUS', {
      orderId: res.data.orderId,
      orderItemId: res.data.id,
      key: 'fired',
      value: status,
    })
    commit('CHANGE_ORDERITEM_STATUS', {
      orderId: res.data.orderId,
      orderItemId: res.data.id,
      key: 'firedTime',
      value: time,
    })
  },
}

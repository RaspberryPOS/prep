export const state = () => ({
  orders: {},
  orderItems: [],
})

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  ADD_ORDER(state, order) {
    this._vm.$set(state.orders, order.id, order)
  },
  SET_ORDERITEMS(state, orderItems) {
    state.orderItems = orderItems
  },
  ADD_ORDERITEMS(state, orderItems) {
    state.orderItems.push(...orderItems)
  },
  REMOVE_ORDER(state, orderId) {
    this._vm.$delete(state.orders, orderId)
    // Remove orderItems associated with Order
    for (let i = state.orderItems.length - 1; i >= 0; i--) {
      if (state.orderItems[i].orderId === orderId) {
        state.orderItems.splice(i, 1)
      }
    }
  },
  CHANGE_ORDERITEM_STATUS(state, { orderId, orderItemId, key, value }) {
    // Find OrderItem in orders[] and change
    state.orders[orderId].orderItems.filter(
      (item) => item.id === orderItemId
    )[0][key] = value
    // Find OrderItem in orderItems[] and change
    state.orderItems.filter((item) => item.id === orderItemId)[0][key] = value
  },
}

function processOrder(order) {
  // Hold all orderItems in order as separate array
  const orderItems = []
  // Parse fields in order to appropriate format first
  order.orderNumber = String(order.orderNumber).padStart(3, '0')
  order.createdAt = new Date(order.createdAt)
  order.completedAt = new Date(order.completedAt)
  order.totalPrice = parseFloat(order.totalPrice)

  // Iterate over all order items and process to more useful form
  order.categoryMapping = {} // Create a mappoing of all order categories and which orderItem.id is in each
  order.menuItemMapping = {} // Create a mapping of all orderItems that are part of the same menuItem (grouping of multiple foods in a single order-able selection)
  order.orderToMenuItemHashMap = {} // Hold the "inverse" of .menuItemMapping {orderId: menuItemhash}
  order.singleItemMapping = [] // Create a list of all IDs that aren't part of a menuItem (a-la-cart items)
  order.orderIdIndex = {}

  for (const [index, item] of order.orderItems.entries()) {
    // Relate orderItem to order
    item.orderId = order.id
    item.orderNumber = order.orderNumber
    // Note index of OrderItem.id
    order.orderIdIndex[item.id] = index
    // Find orderItem category and store in Category mapping
    const orderCategory = item.menuItem?.category
      ? item.menuItem.category
      : item.food?.category
      ? item.food.category
      : 'Other'
    if (orderCategory in order.categoryMapping)
      order.categoryMapping[orderCategory].push(item.id)
    else order.categoryMapping[orderCategory] = [item.id]

    // Find orderItems part of a menuItem and the same menuItemhash and note
    if (item.menuItemhash && item.menuItem) {
      order.orderToMenuItemHashMap[item.id] = item.menuItemhash
      if (item.menuItemhash in order.menuItemMapping)
        order.menuItemMapping[item.menuItemhash].orderItemIds.push(item.id)
      else
        order.menuItemMapping[item.menuItemhash] = {
          menuItem: item.menuItem,
          orderItemIds: [item.id],
        }
    } else {
      order.singleItemMapping.push(item.id)
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

    // Push OrderItem to orderItems
    orderItems.push(item)
  }

  return { orderItems, order }
}

export const actions = {
  async getOrders({ commit }) {
    // Get the incomplete (complete == false) orders from the API
    const res = await this.$api.order.incomplete()

    if (res.status === 200 && res.data) {
      const orderItems = []
      // Parse order data and process attributes
      const orders = res.data.reduce(function (result, order, index, array) {
        const processedOrder = processOrder(order)
        // Done!
        result[order.id] = processedOrder.order
        orderItems.push(...processedOrder.orderItems)
        return result
      }, {})

      // Sort
      commit('SET_ORDERS', orders)
      commit('SET_ORDERITEMS', orderItems)
    } else {
      alert("Couldn't load Orders, refresh the page and try again.")
    }
  },
  addOrder({ commit }, order) {
    const processedOrder = processOrder(order)
    commit('ADD_ORDER', processedOrder.order)
    commit('ADD_ORDERITEMS', processedOrder.orderItems)
  },
}

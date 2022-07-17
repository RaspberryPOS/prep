import Order from '~/api/Order'
import OrderItem from '~/api/OrderItem'

export default ($axios) => ({
  order: Order($axios),
  orderItem: OrderItem($axios),
})

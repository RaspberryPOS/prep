const resource = '/orderItem'

export default ($axios) => ({
  setOrderItemReadyStatus(orderItemId, status) {
    const payload = {
      ready: status,
    }
    return $axios.patch(`${resource}/${orderItemId}`, payload)
  },
  setOrderItemFiringStatus(orderItemId, status, time) {
    const payload = {
      firing: status,
      firingTime: time,
    }
    return $axios.patch(`${resource}/${orderItemId}`, payload)
  },
  setOrderItemFiredStatus(orderItemId, status, time) {
    const payload = {
      fired: status,
      firedTime: time,
    }
    return $axios.patch(`${resource}/${orderItemId}`, payload)
  },
})

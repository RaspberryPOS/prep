const resource = '/order'

export default ($axios) => ({
  all() {
    return $axios.get(`${resource}`)
  },
  incomplete() {
    return $axios.get(`${resource}?complete=false&cancelled=false`)
  },
  complete(id) {
    const payload = {
      complete: true,
      completedAt: new Date(),
    }
    return $axios.patch(`${resource}/${id}`, payload)
  },
})

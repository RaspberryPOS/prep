import createApi from '~/api/API'

export default (ctx, inject) => {
  inject('api', createApi(ctx.$axios))
}

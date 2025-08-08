// import the resource enum
import { Resource } from '~/types/resource';

export default defineNuxtRouteMiddleware((to, from) => {
  // if to.params.resource value is not in the Resource enum, abort the navigation
  if (!Object.values(Resource).includes(to.params.resource as Resource)) {
    return abortNavigation();
  }
})
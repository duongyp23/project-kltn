import Vue from 'vue'
import App from './App.vue'
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDNI_ZWPqvdS6r6gPVO50I4TlYkfkZdXh8', // Thay thế bằng khóa API Google Maps của bạn
    libraries: 'places',
  },
  installComponents: true,
});

new Vue({
  render: h => h(App),
}).$mount('#app')


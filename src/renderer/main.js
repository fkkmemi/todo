import Vue from 'vue'
import axios from 'axios'
import Vuetify from 'vuetify'
import moment from 'moment'
import path from 'path'
import 'vuetify/dist/vuetify.css'

import App from './App'
import router from './router'
import store from './store'
import {remote} from 'electron'

moment.locale('ko')

Vue.use(Vuetify)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.prototype.$moment = moment
Vue.config.productionTip = false

const dbPath = path.join(remote.app.getPath('appData'), 'evtodo', 'todo.db')
const Datastore = require('nedb')
const db = new Datastore({ filename: dbPath })
db.loadDatabase((err) => {
  if (err) console.log(err)
})
Vue.prototype.$db = db

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

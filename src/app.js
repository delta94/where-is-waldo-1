import * as firebase from 'firebase/app'
import PubSub from 'pubsub-js'
import './styles/style.css'
import { View } from './components/View'
import { Model } from './components/Model'

const firebaseConfig = {
  apiKey: 'AIzaSyCfRM7X4m5le2L27z6kyux-gheNQTxxwOA',
  authDomain: 'where-is-waldo-odin.firebaseapp.com',
  databaseURL: 'https://where-is-waldo-odin.firebaseio.com',
  projectId: 'where-is-waldo-odin',
  storageBucket: 'where-is-waldo-odin.appspot.com',
  messagingSenderId: '453350345911',
  appId: '1:453350345911:web:b5801a38742a1d602dd132'
}

firebase.initializeApp(firebaseConfig)

class Controller {
  constructor () {
    this.model = new Model()
    this.view = new View()

    this.initListeners()
    this.initServerData()
  }

  initListeners () {
    /* Passing the background to the View once  the Model has gotten it
      from the server */
    PubSub.subscribe('background_loaded', (msg, URL) => {
      this.view.loadBackgroundImage(URL)
    })
  }

  initServerData () {
    this.model.getBackgroundImageFromServer()
    this.model.getCoordinatesFromServer()
  }
}

const controller = new Controller()
console.log(controller)

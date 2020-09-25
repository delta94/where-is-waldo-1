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

    /* Checking if the the coordinates of the click are correct.
      If so, then updating the game */
    PubSub.subscribe('user_clicked', (msg, { userX, userY, nameChosen }) => {
      const characterFound =
        this.model.checkIfCharacterFound(userX, userY, nameChosen)

      if (characterFound) {
        this.model.updateGameProgressData(characterFound.characterName)
        this.view.updateGameProgressDOM(characterFound.characterName)
        this.view.markCharacterFound()
      } else {
        this.view.showMessageNotFound(userX, userY)
      }

      this.view.removeBoxTarget()
      this.view.removeSearchMenu()
    })

    /* Initializing Game Over */
    PubSub.subscribe('all_characters_found', () => {
      this.view.initializeGameOverDOM()
    })

    /* Passing the user's name to the Model to send it to the server */
    PubSub.subscribe('user_entered_name', (msg, userInput) => {
      this.model.sendUserNameToServerLeaderboard(userInput)
    })

    /* Notifying the user that their name has been successfully added
      to the leaderboard */
    PubSub.subscribe('user_name_sent_successfully', () => {
      this.view.showMessageSentSuccessfully()
    })
  }

  initServerData () {
    this.model.getBackgroundImageFromServer()
    this.model.getCoordinatesFromServer()
  }
}

const controller = new Controller()
console.log(controller)

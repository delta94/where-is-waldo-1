import * as firebase from 'firebase/app'
import PubSub from 'pubsub-js'

import { firebaseConfig } from '../firebase.config'
import './styles/style.css'
import { View } from './components/View'
import { Model } from './components/Model'

firebase.initializeApp(firebaseConfig)

class Controller {
  constructor () {
    this.model = new Model()
    this.view = new View()

    this.initListeners()
    this.initServerData()
    this.view.updateStopWatchDOM()
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
        this.view.displayMessageNotFound(userX, userY)
      }

      this.view.removeBoxTarget()
      this.view.removeSearchMenu()
    })

    /* Initializing Game Over */
    PubSub.subscribe('all_characters_found', () => {
      this.model.sendTimestampToServer('end')

      this.view.initializeGameOverDOM()
      this.view.displayCover()
    })

    /* Displaying the seconds it has taken for the player to beat the game
      in the endgame window */
    PubSub.subscribe('seconds_to_beat_calculated', (msg, seconds) => {
      this.view.displayUserTime(seconds)
    })

    /* Passing the user's name to the Model to send it to the server */
    PubSub.subscribe('user_entered_name', (msg, userInput) => {
      this.model.sendUserNameToServerLeaderboard(userInput)
    })

    /* Notifying the user that their name has been successfully added
      to the leaderboard */
    PubSub.subscribe('user_name_sent_successfully', () => {
      this.view.displayMessageSentSuccessfully()
    })
  }

  async initServerData () {
    this.model.getBackgroundImageFromServer()
    this.model.getCoordinatesFromServer()
    await this.model.sendTimestampToServer('start')
  }
}

const controller = new Controller()
console.log(controller)

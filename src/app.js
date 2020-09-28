import * as firebase from 'firebase/app'
import PubSub from 'pubsub-js'

import { firebaseConfig } from '../firebase.config'
import './styles/style.css'
import { View } from './components/View'
import { Model } from './components/Model'
import { Message } from './components/Message'

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
    PubSub.subscribe(
      'name_in_search_menu_chosen',
      (msg, { userX, userY, nameChosen }
      ) => {
        const characterFound =
          this.model.checkIfCharacterFound(userX, userY, nameChosen)

        if (characterFound) {
          this.model.updateGameProgressData(characterFound.characterName)
          this.view.updateGameProgressDOM(characterFound.characterName)
          this.view.markCharacterFound()
        } else {
          Message.displayMessageNotFound(userX, userY)
        }

        this.view.removeBoxTarget()
        this.view.removeSearchMenu()
      })

    /* The user clicks the restart button and waits for the countdown
      to expire */
    PubSub.subscribe('restart_countdown_expired', () => {
      this.restartGame()
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
      if (this.model.checkIfRecordSet()) {
        Message.displaySubmitBlock()
      } else {
        Message.hideSubmitBlock()
      }
      Message.displayUserTime(seconds)
    })

    /* Passing the user's name and time to the Model
      to send it to the server */
    PubSub.subscribe('username_entered', (msg, userInput) => {
      this.model.sendUserEntryToServerLeaderboard(
        userInput,
        this.model.secondsTakenToBeat
      )
    })

    /* Notifying the user that their name has been successfully added
      to the leaderboard */
    PubSub.subscribe('user_name_sent_successfully', () => {
      Message.displayMessageSentSuccessfully()
    })
  }

  async initServerData () {
    this.model.getBackgroundImageFromServer()
    this.model.getCoordinatesFromServer()
    this.model.sendTimestampToServer('start')
  }

  async restartGame () {
    this.view.resetGameDOM()
    this.model.resetGameData()
    this.model.sendTimestampToServer('start')
  }
}

const controller = new Controller()
console.log(controller)

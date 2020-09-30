import * as firebase from 'firebase/app'
import PubSub from 'pubsub-js'

import { firebaseConfig } from '../firebase.config'
import './styles/style.css'
import { View } from './components/View'
import { Model } from './components/Model'
import { Message } from './components/Message'
import { LevelSelector } from './components/LevelSelector'

firebase.initializeApp(firebaseConfig)

class Controller {
  constructor () {
    this.model = new Model()
    this.view = new View()

    LevelSelector.init()
    this.initListeners()
  }

  initListeners () {
    /* Waiting for the player to choose a level when INITIALIZING the game */
    PubSub.subscribe('level_chosen', async (msg, levelId) => {
      /* Resetting Game Data and DOM */
      this.view.resetGameDOM()
      this.model.resetGameData(true)

      /* Initializing Game Data and DOM */
      await this.initServerData(levelId)
      this.model.initCharactersToFind()
      this.view.initGameDOM(Object.keys(this.model.gameProgress))

      /* Setting the current level id */
      this.model.levelId = levelId
    })

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
    PubSub.subscribe('countdown_expired', () => {
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
        this.model.secondsTakenToBeat,
        this.model.levelId
      )
    })

    /* Notifying the user that their name has been successfully added
      to the leaderboard */
    PubSub.subscribe('user_name_sent_successfully', () => {
      Message.displayMessageSentSuccessfully()
    })
  }

  async initServerData (levelId) {
    this.model.getBackgroundImageFromServer(levelId)
    await this.model.getCoordinatesFromServer(levelId)
    this.model.sendTimestampToServer('start')
  }

  restartGame () {
    this.view.resetGameDOM()
    this.model.resetGameData()
    this.model.initCharactersToFind()
    this.model.sendTimestampToServer('start')
  }
}

const controller = new Controller()
console.log(controller)

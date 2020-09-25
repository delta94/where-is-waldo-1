import * as firebase from 'firebase/app'
import 'firebase/firestore'
import PubSub from 'pubsub-js'

export class Model {
  constructor () {
    this.coordinatesArray = []

    this.gameProgress = {
      waldo: false,
      odlaw: false,
      wizard: false
    }

    /* Checking if the player has found all characters
      each time they find one */
    PubSub.subscribe('game_progress_data_updated', () => {
      const areAllFound =
        Object.entries(this.gameProgress).every(([key, value]) => {
          return value === true
        })

      /* Notifying the Controller when all characters have been found */
      if (areAllFound) PubSub.publish('all_characters_found')
    })
  }

  async getBackgroundImageFromServer () {
    try {
      const bgImages = firebase.firestore().collection('images')

      const response = await bgImages.doc('background-1').get()
      const responseObject = response.data()

      /* Sending it to the Controller */
      PubSub.publish('background_loaded', responseObject.URL)
    } catch (error) {
      console.log('(When getting the background image): ' + error)
    }
  }

  async getCoordinatesFromServer () {
    try {
      const coordinatesCollection =
        firebase.firestore().collection('coordinates')

      const response = await coordinatesCollection.get()

      response.forEach(responsePiece => {
        this.coordinatesArray.push(responsePiece.data())
      })
    } catch (error) {
      console.log('(When getting the coordinates): ' + error)
    }
  }

  sendUserNameToServerLeaderboard (userName) {
    const leaderboard = firebase.firestore().collection('leaderboard')
    leaderboard.add({ userName })
      .then(() => {
        /* Notifying the Controller if the name has been successfully sent
          to the server */
        PubSub.publish('user_name_sent_successfully')
      })
      .catch(error => {
        console.log('(When sending the user name to the server)' + error)
      })
  }

  checkIfCharacterFound (userX, userY, nameChosen) {
    return this.coordinatesArray.find(item => {
      if (userY > item.yMin && userY < item.yMax &&
          userX > item.xMin && userX < item.xMax &&
          nameChosen === item.characterName) {
        console.log(`Found ${item.characterName}!`)
        return item
      } else {
        return false
      }
    })
  }

  updateGameProgressData (characterName) {
    this.gameProgress[characterName] = true
    PubSub.publish('game_progress_data_updated')
  }
}

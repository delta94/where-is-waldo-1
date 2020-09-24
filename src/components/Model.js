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

  checkIfCharacterFound (userCoordinates) {
    const { userX, userY } = userCoordinates

    return this.coordinatesArray.find(item => {
      if (userY > item.yMin && userY < item.yMax &&
          userX > item.xMin && userX < item.xMax) {
        console.log(`Found ${item.characterName}!`)
        return item
      } else {
        return false
      }
    })
  }

  updateGameProgressData (characterName) {
    this.gameProgress[characterName] = true
  }
}

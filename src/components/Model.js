import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/firebase-storage'
import PubSub from 'pubsub-js'

export class Model {
  constructor () {
    this.coordinatesArray = []
    this.timestampSeconds = {}
    this.secondsTakenToBeat = 0
    this.levelId = ''

    this.gameProgress = {}

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

    /* Calculating the seconds it has took for the player
      to find all characters and notifying the Controller about it */
    PubSub.subscribe('timestamps_loaded', () => {
      this.secondsTakenToBeat =
        this.timestampSeconds.end - this.timestampSeconds.start

      PubSub.publish('seconds_to_beat_calculated', this.secondsTakenToBeat)
    })
  }

  /* Checking how many characters are on the picture.
    Then adding each one into the gameProgress object. */
  initCharactersToFind () {
    for (const character of this.coordinatesArray) {
      this.gameProgress[character.characterName] = false
    }
  }

  async getBackgroundImageFromServer (levelId) {
    try {
      const storage = firebase.storage()
      const imageLevel1 = storage.ref(`images/background/${levelId}.jpg`)
      const imageURL = await imageLevel1.getDownloadURL()

      /* Sending it to the Controller */
      PubSub.publish('background_loaded', imageURL)
    } catch (error) {
      throw new Error('(When getting the background image): ' + error)
    }
  }

  async getCoordinatesFromServer (levelId) {
    try {
      const coordinatesCollection = firebase.firestore()
        .collection('coordinates').doc(levelId).collection('coordinates')

      const response = await coordinatesCollection.get()

      response.forEach(responsePiece => {
        this.coordinatesArray.push(responsePiece.data())
      })
    } catch (error) {
      throw new Error('(When getting the coordinates): ' + error)
    }
  }

  async getTimestampFromServer (documentName) {
    try {
      const collectionTimestamp = firebase.firestore().collection('timestamp')

      const response = await collectionTimestamp.doc(documentName).get()
      const timestampObject = response.data()

      /* Saving the received timestamp in the object */
      this.timestampSeconds[documentName] =
        timestampObject.currentTimestamp.seconds

      /* When getting the second(last) timestamp */
      if (documentName === 'end') {
        PubSub.publish('timestamps_loaded')
      }
    } catch (error) {
      throw new Error('(When getting a timestamp): ' + error)
    }
  }

  async sendTimestampToServer (documentName) {
    const collectionTimestamp = firebase.firestore().collection('timestamp')

    collectionTimestamp.doc(documentName).set({
      currentTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
      .then(() => {
        /* Saving the timestamp in the Model right away */
        this.getTimestampFromServer(documentName)
      })
      .catch(error => {
        throw new Error('(When sending a timestamp to the server):' + error)
      })
  }

  sendUserEntryToServerLeaderboard (userName, time, levelId) {
    const leaderboard = firebase.firestore().collection('leaderboard')
      .doc(levelId).collection('leaderboard')
    leaderboard.add({ userName, time })
      .then(() => {
        /* Notifying the Controller if the name has been successfully sent
          to the server */
        PubSub.publish('user_name_sent_successfully')
      })
      .catch(error => {
        throw new Error('(When sending the user name to the server)' + error)
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

  async checkIfRecordSet (levelId) {
    const leaderboard = firebase.firestore().collection('leaderboard')
      .doc(levelId).collection('leaderboard')
    const response = await leaderboard.get()

    let isRecordSet = false
    let responseLength = 0

    response.forEach(responsePiece => {
      if (this.secondsTakenToBeat < responsePiece.data().time) {
        isRecordSet = true
      }
      responseLength++
    })

    /* Adding the user to the leaderboard if there are less than 20 entries */
    if (responseLength < 20) isRecordSet = true

    return isRecordSet
  }

  updateGameProgressData (characterName) {
    this.gameProgress[characterName] = true
    PubSub.publish('game_progress_data_updated')
  }

  resetGameData (isLevelChanged = false) {
    if (isLevelChanged) {
      this.coordinatesArray = []
      this.levelId = ''
    }

    this.timestampSeconds = {}
    this.secondsTakenToBeat = 0
    this.gameProgress = {}
  }
}

import PubSub from 'pubsub-js'

export class Message {
  static init () {
    this.initListeners()
  }

  static initListeners () {
    /* Closing the endgame pop-up window and removing the input value */
    const messageEndgame = document.getElementById('message-endgame')
    const messageEndgameInput = messageEndgame.querySelector('input')
    const messageEndgameButtonClose = messageEndgame.querySelector('a')

    messageEndgameButtonClose.addEventListener('click', () => {
      messageEndgame.style.visibility = 'hidden'
      messageEndgameInput.value = ''
    })

    /* Adding the user's input (name only) to the leaderboard */
    const messageEndgameButtonSubmit = messageEndgame.querySelector('button')
    messageEndgameButtonSubmit.addEventListener('click', () => {
      if (messageEndgameInput.value !== '') {
        PubSub.publish('username_entered', messageEndgameInput.value)
      }

      messageEndgame.style.visibility = 'hidden'
      messageEndgameInput.value = ''
    })

    /* Closing the notification of a successful username upload */
    const messageNameAdded = document.getElementById('message-name-added')
    const messageNameAddedButtonClose = messageNameAdded.querySelector('a')

    messageNameAddedButtonClose.addEventListener('click', () => {
      messageNameAdded.style.visibility = 'hidden'
    })
  }

  static displayMessageNotFound (x, y) {
    const gameField = document.getElementById('game-field')
    const templateMessageNotFound =
      document.getElementById('message-not-found')

    const messageNotFound = templateMessageNotFound.cloneNode(true)

    messageNotFound.style.top = y + 'px'
    messageNotFound.style.left = x + 'px'
    messageNotFound.style.visibility = 'visible'
    gameField.append(messageNotFound)

    /* The close button */
    const buttonClose = messageNotFound.querySelector('#message-not-found-btn-close')
    buttonClose.addEventListener('click', () => {
      messageNotFound.remove()
    })

    setTimeout(() => {
      if (messageNotFound) messageNotFound.remove()
    }, 1700)
  }

  static displayMessageSentSuccessfully () {
    const messageNameAdded = document.getElementById('message-name-added')
    messageNameAdded.style.visibility = 'visible'

    setTimeout(() => {
      messageNameAdded.style.visibility = 'hidden'
    }, 4000)
  }

  static displaymessageCountdown () {
    const messageCountdown =
      document.getElementById('message-countdown')

    let counter = 3

    messageCountdown.textContent = counter
    messageCountdown.style.visibility = 'visible'

    /* Counting down before resetting the game */
    const interval = setInterval(() => {
      counter--
      messageCountdown.textContent = counter

      if (counter < 1) {
        messageCountdown.style.visibility = 'hidden'
        PubSub.publish('countdown_expired')
        clearInterval(interval)
      }
    }, 1000)
  }

  /* Allowing the player to add their name to the leaderboard
      if they have found all characters in record time */
  static displaySubmitBlock () {
    const blockSubmitToLeaderboard =
        document.getElementById('block-submit-to-leaderboard')
    blockSubmitToLeaderboard.style.display = 'flex'
  }

  /* NOT allowing the player to add their name to the leaderboard
      if they have found all characters in record time */
  static hideSubmitBlock () {
    const blockSubmitToLeaderboard =
        document.getElementById('block-submit-to-leaderboard')
    blockSubmitToLeaderboard.style.display = 'none'
  }

  static displayUserTime (seconds) {
    const textCongratulations =
      document.querySelector('#message-endgame-body p')
    textCongratulations.innerHTML =
      `You have found all characters in <b>${seconds} seconds</b>.`
  }

  static displayMessageEndgame () {
    const messageEndgame = document.getElementById('message-endgame')
    messageEndgame.style.visibility = 'visible'
  }
}

Message.init()

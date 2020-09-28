import {
  createElement,
  convertToNumberFromCSS
} from '../utilities/helperFunctions'

import PubSub from 'pubsub-js'

export class View {
  constructor () {
    this.isBoxTargetClicked = false
    this.isMenuSearchClicked = false
    this.currentClickCoordinates = {}

    this.initListeners()
    this.resetGameDOM()
  }

  initListeners () {
    /* The user clicks on the background */
    const imgBackground = document.getElementById('img-background')
    imgBackground.addEventListener('click', (e) => {
      this.placeBoxTarget(e)
    })
    imgBackground.addEventListener('click', (e) => {
      this.displaySearchMenu(e)
    })

    /* Adding listeners to search menu options
      WHEN search menu has been created */
    PubSub.subscribe('search_menu_created', (msg, options) => {
      options.forEach(option => {
        option.addEventListener('click', () => {
          this.sendUserClickData(option)
        })
      })
    })

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
        PubSub.publish('user_entered_name', messageEndgameInput.value)
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

    /* Restart button */
    const buttonRestart = document.getElementById('btn-restart')
    buttonRestart.addEventListener('click', () => {
      PubSub.publish('restart_button_clicked')
    })
  }

  loadBackgroundImage (URL) {
    const imgBackground = document.getElementById('img-background')
    imgBackground.src = URL
  }

  placeBoxTarget (e) {
    const rootElement = document.getElementById('game-field')

    /* Removing the element when clicked outside of it */
    this.isBoxTargetClicked = !this.isBoxTargetClicked

    /* Checking if there is a box created already. If so deleting it */
    const previousBoxTarget = document.getElementById('box-target')
    if (previousBoxTarget) previousBoxTarget.remove()

    if (this.isBoxTargetClicked) {
      const boxTarget = createElement('div', null, 'box-target', rootElement)
      const boxTargetWidth =
        convertToNumberFromCSS(window.getComputedStyle(boxTarget).width)

      /* Placing boxTarget on the coordinates of the user's click */
      boxTarget.style.left = e.offsetX - (boxTargetWidth / 2) + 'px'
      boxTarget.style.top = e.offsetY + 'px'

      /* Saving the coordinates of the click to use later */
      this.currentClickCoordinates = {
        userX: e.offsetX,
        userY: e.offsetY
      }
    } else {
      /* Deleting the current coordinates once the player clicks
        outside of the menu */
      this.currentClickCoordinates = {}
    }
  }

  displaySearchMenu (e) {
    const rootElement = document.getElementById('game-field')

    /* Removing the element when clicked outside of it */
    this.isMenuSearchClicked = !this.isMenuSearchClicked

    /* Checking if there is a menu created already. If so deleting it */
    const previousMenuSearch = document.getElementById('menu-search-container')
    if (previousMenuSearch) previousMenuSearch.remove()

    if (this.isMenuSearchClicked) {
      /* Creating a search menu */
      const menuSearchContainer =
        createElement('div', null, 'menu-search-container', rootElement)

      const optionWaldo = createElement(
        'div',
        'menu-search-option',
        'menu-search-option-waldo',
        menuSearchContainer
      )
      optionWaldo.textContent = 'Waldo'

      const optionOdlaw = createElement(
        'div',
        'menu-search-option',
        'menu-search-option-odlaw',
        menuSearchContainer
      )
      optionOdlaw.textContent = 'Odlaw'

      const optionWizard = createElement(
        'div',
        'menu-search-option',
        'menu-search-option-wizard',
        menuSearchContainer
      )
      optionWizard.textContent = 'Wizard'

      /* Placing menuSearchContainer on the coordinates of the user's click */
      menuSearchContainer.style.left = e.offsetX + 40 + 'px'
      menuSearchContainer.style.top = e.offsetY + 15 + 'px'

      /* Notifying this.initListeners() function so that
        it can create event listeners for the options */
      PubSub.publish('search_menu_created', [
        optionWaldo,
        optionOdlaw,
        optionWizard
      ])
    }
  }

  updateGameProgressDOM (characterName) {
    const characterCheckbox =
      document.getElementById(`checkbox-${characterName}`)

    characterCheckbox.checked = true
  }

  resetGameDOM () {
    /* Resetting checkboxes in the header */
    const checkboxes = document.querySelectorAll('#header-progress input')
    checkboxes.forEach(checkbox => {
      checkbox.checked = false
    })

    /* Resetting the input when prompting for the user's name */
    const messageEndgameInput =
      document.querySelector('#message-endgame-body input')
    messageEndgameInput.value = ''

    /* Removing marks that the user has placed */
    const marks = document.querySelectorAll('.mark')
    marks.forEach(mark => {
      mark.remove()
    })

    /* Hiding the cover that stops the player from clicking
      on the background image */
    const cover = document.getElementById('cover')
    cover.style.visibility = 'hidden'

    /* Hiding the endgame message */
    const messageEndgame = document.getElementById('message-endgame')
    messageEndgame.style.visibility = 'hidden'

    /* Hiding the message about successfully adding the name
      to the leaderboard */
    const messageNameAdded = document.getElementById('message-name-added')
    messageNameAdded.style.visibility = 'hidden'
  }

  sendUserClickData (eventTarget) {
    const characterNameLowerCase = eventTarget.textContent.toLowerCase()

    const userData = Object.assign(this.currentClickCoordinates, {
      nameChosen: characterNameLowerCase
    })

    /* Sending the coordinates of the click and the character name
    that the player has chosen in the menu to the Controller */
    PubSub.publish('user_clicked', userData)
  }

  markCharacterFound () {
    const rootElement = document.getElementById('game-field')
    const boxTarget = document.getElementById('box-target')

    if (boxTarget) {
      const mark = boxTarget.cloneNode(true)

      mark.removeAttribute('id')
      mark.classList.add('mark')

      rootElement.append(mark)
    } else {
      throw new Error(`(When marking the found character):
                        The boxTarget is not found.`)
    }
  }

  removeBoxTarget () {
    const boxTarget = document.getElementById('box-target')
    boxTarget.remove()
    this.isBoxTargetClicked = false
  }

  removeSearchMenu () {
    const menuSearch = document.getElementById('menu-search-container')
    menuSearch.remove()
    this.isMenuSearchClicked = false
  }

  displayMessageNotFound (x, y) {
    const gameField = document.getElementById('game-field')
    const templateMessageNotFound =
      document.getElementById('message-not-found')

    const messageNotFound = templateMessageNotFound.cloneNode(true)

    messageNotFound.style.top = y + 'px'
    messageNotFound.style.left = x + 'px'
    messageNotFound.style.visibility = 'visible'
    gameField.append(messageNotFound)

    /* The close button */
    const buttonClose = messageNotFound.querySelector('#message-btn-close')
    buttonClose.addEventListener('click', () => {
      messageNotFound.remove()
    })

    setTimeout(() => {
      if (messageNotFound) messageNotFound.remove()
    }, 1700)
  }

  displayMessageSentSuccessfully () {
    const messageNameAdded = document.getElementById('message-name-added')
    messageNameAdded.style.visibility = 'visible'

    setTimeout(() => {
      messageNameAdded.style.visibility = 'hidden'
    }, 4000)
  }

  initializeGameOverDOM () {
    const messageEndgame = document.getElementById('message-endgame')
    messageEndgame.style.visibility = 'visible'
  }

  displayUserTime (seconds) {
    const textCongratulations =
      document.querySelector('#message-endgame-body p')
    textCongratulations.innerHTML =
      `You have found all characters in <b>${seconds} seconds</b>.`
  }

  /* Displaying an element that stops the player from clicking
    on the background image */
  displayCover () {
    const imgBackground = document.getElementById('img-background')
    const cover = document.getElementById('cover')

    cover.style.cssText = `
      top: ${imgBackground.offsetTop}px;
      width: ${imgBackground.width}px;
      height: ${imgBackground.height}px;
      visibility: visible;
    `
  }
}

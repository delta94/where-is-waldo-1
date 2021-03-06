import {
  createElement,
  convertToNumberFromCSS
} from '../utilities/helperFunctions'
import { Message } from './Message'

import PubSub from 'pubsub-js'

export class View {
  constructor () {
    this.isBoxTargetClicked = false
    this.isMenuSearchClicked = false
    this.currentClickCoordinates = {}

    this.initListeners()
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

    /* Restart button */
    const buttonRestart = document.getElementById('btn-restart')
    buttonRestart.addEventListener('click', () => {
      Message.displayMessageCountdown()
    })

    /* Level-selector button in the header */
    const buttonSelectLevel = document.getElementById('btn-select-level')
    const levelSelectorWindow = document.getElementById('level-selector')
    buttonSelectLevel.addEventListener('click', () => {
      levelSelectorWindow.classList.toggle('not-visible')
    })
  }

  initGameDOM (characterNamesArray) {
    /* Hiding the game title */
    const titleGame = document.getElementById('title-game')
    titleGame.style.display = 'none'

    /* Displaying characters in the header to track user progress */
    const itemsProgress = document.querySelectorAll('.progress-item')

    itemsProgress.forEach(item => {
      item.style.display = 'none'
    })

    itemsProgress.forEach(item => {
      /* Displaying only the characters that are present in the picture */
      for (let i = 0; i < characterNamesArray.length; i++) {
        if (item.id === `progress-item-${characterNamesArray[i]}`) {
          item.style.display = 'flex'
        }
      }
    })

    /* Displaying the restart button in the header */
    const buttonRestart = document.getElementById('btn-restart')
    buttonRestart.style.visibility = 'visible'

    /* Displaying the level-selector button in the header */
    const buttonSelectLevel = document.getElementById('btn-select-level')
    buttonSelectLevel.style.visibility = 'visible'
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

      const optionWenda = createElement(
        'div',
        'menu-search-option',
        'menu-search-option-wenda',
        menuSearchContainer
      )
      optionWenda.textContent = 'Wenda'

      /* Placing menuSearchContainer on the coordinates of the user's click */
      menuSearchContainer.style.left = e.offsetX + 40 + 'px'
      menuSearchContainer.style.top = e.offsetY + 15 + 'px'

      /* Notifying this.initListeners() function so that
        it can create event listeners for the options */
      PubSub.publish('search_menu_created', [
        optionWaldo,
        optionOdlaw,
        optionWizard,
        optionWenda
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
    const checkboxes = document.querySelectorAll('#header-game input')
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

    /* Hiding the level-selector window */
    const levelSelectorWindow = document.getElementById('level-selector')
    levelSelectorWindow.classList.add('not-visible')
  }

  sendUserClickData (eventTarget) {
    const characterNameLowerCase = eventTarget.textContent.toLowerCase()

    const userData = Object.assign(this.currentClickCoordinates, {
      nameChosen: characterNameLowerCase
    })

    /* Sending the coordinates of the click and the character name
    that the player has chosen in the menu to the Controller */
    PubSub.publish('name_in_search_menu_chosen', userData)
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

  initializeGameOverDOM () {
    Message.displayMessageEndgame()
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

import { createElement, convertToNumberFromCSS } from '../utilities/helperFunctions'

export class View {
  static init () {
    this.initListeners()
  }

  static initListeners () {
    /* The user clicks on the background */
    const imgBackground = document.getElementById('img-background')
    imgBackground.addEventListener('click', this.placeBoxTarget)
  }

  static placeBoxTarget (e) {
    const rootElement = document.getElementById('app')

    /* Checking if there is a box created already. If so deleting it */
    const previousBoxTarget = document.getElementById('box-target')
    if (previousBoxTarget) previousBoxTarget.remove()

    const boxTarget = createElement('div', null, 'box-target', rootElement)
    const boxTargetHeight =
      convertToNumberFromCSS(window.getComputedStyle(boxTarget).height)
    const boxTargetWidth =
      convertToNumberFromCSS(window.getComputedStyle(boxTarget).width)

    /* Placing boxTarget on the coordinates of the user's click */
    boxTarget.style.left = e.pageX - (boxTargetWidth / 2) + 'px'
    boxTarget.style.top = e.pageY - (boxTargetHeight / 2) + 'px'

    // if (e.pageY > 358 && e.pageY < 432 &&
    //     e.pageX > 569 && e.pageX < 594) {
    //   console.log('Found Waldo!')
    // }
  }
}

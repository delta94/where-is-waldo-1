import { Model } from '../components/Model'

describe('initCharactersToFind', () => {
  test(`The fetched coordinates from the server are converted to a character
    that the player needs to find`, () => {
    const model = new Model()
    model.coordinatesArray = [{
      characterName: 'odlaw',
      xMax: 269,
      xMin: 222,
      yMax: 430,
      yMin: 348
    }]
    model.initCharactersToFind()
    expect(model.gameProgress).toEqual({ odlaw: false })
  })

  test('There can be multiple characters', () => {
    const model = new Model()
    model.coordinatesArray = [
      {
        characterName: 'odlaw',
        xMax: 269,
        xMin: 222,
        yMax: 430,
        yMin: 348
      },
      {
        characterName: 'wizard',
        xMax: 671,
        xMin: 612,
        yMax: 420,
        yMin: 348
      },
      {
        characterName: 'waldo',
        xMax: 565,
        xMin: 514,
        yMax: 408,
        yMin: 345
      }
    ]
    model.initCharactersToFind()
    expect(model.gameProgress).toEqual({
      odlaw: false,
      wizard: false,
      waldo: false
    })
  })
})

describe('getCoordinatesFromServer', () => {
  test(`Fetched coordinates from the first level should be stored in
    coordinatesArray`, async () => {
    const level1FireBaseInfo = [
      {
        characterName: 'odlaw',
        xMax: 269,
        xMin: 222,
        yMax: 430,
        yMin: 348
      },
      {
        characterName: 'waldo',
        xMax: 565,
        xMin: 514,
        yMax: 408,
        yMin: 345
      },
      {
        characterName: 'wizard',
        xMax: 671,
        xMin: 612,
        yMax: 420,
        yMin: 348
      }
    ]
    const model = new Model()
    model.getCoordinatesFromServer = jest.fn((levelId) => {
      if (levelId === 'level-1') {
        level1FireBaseInfo.forEach(pieceInfo => {
          model.coordinatesArray.push(pieceInfo)
        })
      }
    })
    model.getCoordinatesFromServer('level-1')
    expect(model.coordinatesArray).toEqual([
      {
        characterName: 'odlaw',
        xMax: 269,
        xMin: 222,
        yMax: 430,
        yMin: 348
      },
      {
        characterName: 'waldo',
        xMax: 565,
        xMin: 514,
        yMax: 408,
        yMin: 345
      },
      {
        characterName: 'wizard',
        xMax: 671,
        xMin: 612,
        yMax: 420,
        yMin: 348
      }
    ])
  })
})

test('Given a character name change gameProgress object', () => {
  const model = new Model()
  model.updateGameProgressData('waldo')
  expect(model.gameProgress.waldo).toEqual(true)
})

test('Given another character name change gameProgress object', () => {
  const model = new Model()
  model.updateGameProgressData('odlaw')
  expect(model.gameProgress.odlaw).toEqual(true)
})

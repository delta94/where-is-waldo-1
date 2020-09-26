import { Model } from '../components/Model'

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

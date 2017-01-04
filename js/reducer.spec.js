import reducer, {
  initialState,
  initCards,
  moveCard,
} from './reducer'

const move = (sourceId, targetId) => (
  moveCard({ sourceId, targetId })
)

describe('reducers/cards', () => {
  describe('reducer', () => {
    describe('initCards({ cards, places })', () => {
      it('generates new state', () => {
        const variants = ['hello', 'world']
        const action = initCards(variants)
        const actual = reducer(undefined, action)
        const expected = {
          ...initialState,
          cards: {
            hello: { id: 'hello', title: 'hello' },
            world: { id: 'world', title: 'world' },
          },
          places: {
            hello: { id: 'hello', title: 'hello', child: null },
            world: { id: 'world', title: 'world', child: null },
          },
        }
        expect(actual.cards).toEqual(expected.cards)
        expect(actual.places).toEqual(expected.places)
      })
    })

    describe('moveCard({ sourceId, targetId})', () => {
      const state = {
        ...initialState,
        cards: {
          hello: { title: 'hello' },
          world: { title: 'world' },
        },
        places: {
          hello: { title: 'hello', child: null },
          world: { title: 'world', child: null },
        },
      }

      describe('move card to place', () => {
        it('moves cards to places', () => {
          const action = move('hello', 'world')
          const actual = reducer(state, action)
          const expected = {
            ...state,
            places: {
              hello: { title: 'hello', child: null },
              world: { title: 'world', child: 'hello' },
            },
            availableCards: ['world'],
          }
          expect(actual).toEqual(expected)
        })

        it('clears the previous placed card', () => {
          const theState = {
            ...state,
            places: {
              hello: { title: 'hello', child: 'hello' },
              world: { title: 'world', child: null },
            },
          }
          const action = move('hello', 'world')
          const actual = reducer(theState, action)
          const expected = {
            ...state,
            places: {
              hello: { title: 'hello', child: null },
              world: { title: 'world', child: 'hello' },
            },
            availableCards: ['world'],
          }
          expect(actual).toEqual(expected)
        })

        it('removes the previous card form the place', () => {
          const theState = {
            ...state,
            places: {
              hello: { title: 'hello', child: 'hello' },
              world: { title: 'world', child: 'world' },
            },
          }
          const action = move('hello', 'world')
          const actual = reducer(theState, action)
          const expected = {
            ...state,
            places: {
              hello: { title: 'hello', child: null },
              world: { title: 'world', child: 'hello' },
            },
            availableCards: ['world'],
          }
          expect(actual).toEqual(expected)
        })
      })

      it('is completes the game when all cards are in places', () => {
        const { cards } = state
        const { places } = state
        const helloIsCorrect = {
          ...state,
          places: {
            ...places,
            hello: {
              ...places.hello,
              child: 'hello',
            },
          },
        }

        const thereAreMoreWords = {
          ...helloIsCorrect,
          cards: {
            ...helloIsCorrect.cards,
            other: { title: 'other', child: null },
          },
        }
        const action = move('world', 'world')
        const actual = reducer(thereAreMoreWords, action)
        const expected = {
          ...thereAreMoreWords,
          places: {
            hello: { title: 'hello', child: 'hello' },
            world: { title: 'world', child: 'world' },
          },
          completed: true,
          availableCards: ['other'],
        }
        expect(actual).toEqual(expected)
      })
    })
  })
})

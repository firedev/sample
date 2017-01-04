import compact from 'lodash/compact'
import find from 'lodash/find'
import shuffle from 'lodash/shuffle'
import map from 'lodash/map'
import without from 'lodash/without'

const INIT = 'MatchWord/INIT'
const MOVE = 'MatchWord/MOVE'
const RESET = 'MatchWord/RESET'

export const initialState = {
  cards: {},
  places: {},
  completed: null,
  availableCards: [],
}

const placesReducer = (a, word) => ({
  ...a,
  [word]: {
    id: word,
    title: word,
    child: null,
  },
})
const cardsReducer = (a, card) => ({
  ...a,
  [card]: {
    id: card,
    title: card,
  },
})

const checkCompleted = ({ places }, availableCards) => {
  const keys = Object.keys(places)
  const { length } = keys
  const completedCards = compact(keys.map(key => (places[key].child === key)))
  if (!availableCards.length && completedCards.length !== length) return false
  return length === completedCards.length || null
}

export const initCards = (variants) => ({
  type: INIT,
  payload: {
    variants,
  },
})

export const moveCard = ({ sourceId, targetId }) => ({
  type: MOVE,
  payload: {
    sourceId,
    targetId,
  },
})

const removeCardFromPlace = (places, cardSourceId) => {
  const placeToClear = find(places, p => p.child === cardSourceId)
  if (placeToClear) {
    return {
      [placeToClear.title]: {
        ...placeToClear,
        child: null,
      },
    }
  }
  return {}
}

const findAvailableCards = (cards, places) =>
  without(Object.keys(cards), ...map(places, 'child'))

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case INIT: {
      const { variants: _variants } = payload
      const variants = _variants.slice(0, 4)
      const cards = shuffle(variants).reduce(cardsReducer, {})
      const places = variants.reduce(placesReducer, {})
      const availableCards = findAvailableCards(cards, places)
      const newState = {
        availableCards,
        cards,
        places,
      }
      return { ...initialState, ...newState }
    }
    case MOVE: {
      const { sourceId, targetId } = payload
      const { cards, places } = state
      const oldPlaceClear = removeCardFromPlace(places, sourceId)

      const newSourcePlace = {
        [targetId]: {
          ...places[targetId],
          child: sourceId,
        },
      }
      const newPlaces = {
        ...places,
        ...newSourcePlace,
        ...oldPlaceClear,
      }
      const newState = {
        ...state,
        places: newPlaces,
      }
      const availableCards = findAvailableCards(cards, newPlaces)
      const completed = checkCompleted(newState, availableCards)

      return {
        ...state,
        ...newState,
        availableCards,
        completed,
      }
    }
    case RESET: {
      return initialState
    }
    default: {
      return state
    }
  }
}

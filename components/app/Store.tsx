import { createContext, useMemo, useReducer } from 'react'
import type { Dispatch, FC, Reducer } from 'react'
import type { FlagName } from '~lib/flags'

export interface State {
  dirty: boolean
  quality: number
  padding: number
  angle: number
  flag: FlagName
  image: HTMLImageElement | null
  frames: HTMLCanvasElement[] | null
  delay: number
  showEasterEgg: boolean
  saving: boolean
  advertOpen: boolean
  shownAdvert: boolean
}

const initialState: State = {
  dirty: true,
  quality: 3,
  padding: 12,
  angle: 0,
  flag: 'Pastel',
  image: null,
  frames: null,
  delay: -1,
  showEasterEgg: false,
  saving: false,
  advertOpen: false,
  shownAdvert:
    typeof window === 'undefined'
      ? false
      : Boolean(localStorage.getItem('shownAdvert')) ?? false,
}

interface Context {
  state: State
  dispatch: Dispatch<Action>
}

// @ts-expect-error
export const store = createContext<Context>({ state: initialState })

export type Action =
  | { type: 'markClean' }
  | { type: 'setQuality'; value: number }
  | { type: 'setPadding'; value: number }
  | { type: 'setAngle'; value: number }
  | { type: 'setFlag'; value: FlagName }
  | { type: 'setImage'; value: string }
  | { type: 'setGif'; value: [frames: HTMLCanvasElement[], delay: number] }
  | { type: 'toggleEasterEgg' }
  | { type: 'setSaving'; value: boolean }
  | { type: 'setAdShowing'; value: boolean }
  | { type: 'markAdShown' }

export const Provider: FC = ({ children }) => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(
    (prevState, action) => {
      switch (action.type) {
        case 'markClean':
          return { ...prevState, dirty: false }

        case 'setQuality':
          return { ...prevState, dirty: true, quality: action.value }

        case 'setPadding':
          return { ...prevState, dirty: true, padding: action.value }

        case 'setAngle': {
          const snap = 0.25
          const raw = action.value

          const angle = raw > snap * -1 && raw < snap ? 0 : raw
          return { ...prevState, dirty: true, angle }
        }

        case 'setFlag':
          return { ...prevState, dirty: true, flag: action.value }

        case 'setImage': {
          prevState.image?.remove()
          for (const frame of prevState?.frames ?? []) {
            frame.remove()
          }

          const image = new Image()
          image.src = action.value

          return { ...prevState, dirty: true, frames: null, delay: -1, image }
        }

        case 'setGif': {
          prevState.image?.remove()
          for (const frame of prevState?.frames ?? []) {
            frame.remove()
          }

          const [frames, delay] = action.value
          return { ...prevState, dirty: true, image: null, frames, delay }
        }

        case 'toggleEasterEgg':
          return { ...prevState, showEasterEgg: !prevState.showEasterEgg }

        case 'setSaving':
          return { ...prevState, saving: action.value }

        case 'setAdShowing':
          return { ...prevState, advertOpen: action.value }

        case 'markAdShown': {
          localStorage.setItem('shownAdvert', '1')
          return { ...prevState, shownAdvert: true }
        }

        default:
          throw new Error('Invalid Action')
      }
    },
    initialState
  )

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch])
  return <store.Provider value={value}>{children}</store.Provider>
}

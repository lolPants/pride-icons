import { decompressFrames, parseGIF } from 'gifuct-js'
import type { Dispatch } from 'react'
import type { Action } from '~components/app/Store'

export const loadImage = async (dispatch: Dispatch<Action>, file: File) => {
  if (file.type !== 'image/gif') {
    dispatch({ type: 'setImage', value: URL.createObjectURL(file) })
    return
  }

  const gif = parseGIF(await file.arrayBuffer())
  const decoded = decompressFrames(gif, true)

  if (decoded.length === 0) return
  if (decoded.length === 1) {
    dispatch({ type: 'setImage', value: URL.createObjectURL(file) })
    return
  }

  const { delay } = decoded[0]
  const frames = decoded.map(
    ({ patch, dims: { width, height, top, left } }) => {
      const canvas = document.createElement('canvas')
      canvas.width = gif.lsd.width
      canvas.height = gif.lsd.height

      const ctx = canvas.getContext('2d')
      if (ctx === null) throw new Error('oh no')

      const data = new ImageData(patch, width, height)
      ctx.putImageData(data, left, top)

      return canvas
    }
  )

  dispatch({ type: 'setGif', value: [frames, delay] })
}

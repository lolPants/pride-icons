import { useCallback, useMemo } from 'react'
import type { DragEventHandler, FC, RefObject } from 'react'
import { useAnimationFrame } from '~lib/hooks/useAnimationFrame'
import { useStore } from '~lib/hooks/useStore'
import { loadImage } from '~lib/load'
import { qualityToResolution } from '~lib/quality'
import { drawFrame } from '~lib/render'

interface Props {
  children?: never
  canvasRef: RefObject<HTMLCanvasElement>
}

export const Canvas: FC<Props> = ({ canvasRef: ref }) => {
  const { state, dispatch } = useStore()
  useAnimationFrame(({ time }) => {
    if (state.saving) return
    if (!ref.current) return
    if (!state.dirty && state.frames === null) return

    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    void drawFrame(canvas, ctx, state, time)
    dispatch({ type: 'markClean' })
  }, [])

  const handleDragOver = useCallback<DragEventHandler<HTMLCanvasElement>>(
    ev => {
      ev.preventDefault()
    },
    []
  )

  const handleDrop = useCallback<DragEventHandler<HTMLCanvasElement>>(
    async ev => {
      ev.preventDefault()
      if (!ev.dataTransfer) return

      const file = ev.dataTransfer.items
        ? ev.dataTransfer.items[0].getAsFile()
        : ev.dataTransfer.files[0]

      if (!file) return
      if (!file.type.startsWith('image/')) return

      await loadImage(dispatch, file)
    },
    [dispatch]
  )

  const resolution = useMemo(
    () => qualityToResolution(state.quality),
    [state.quality]
  )

  return (
    <canvas
      ref={ref}
      className='w-full h-auto rounded'
      width={resolution}
      height={resolution}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  )
}

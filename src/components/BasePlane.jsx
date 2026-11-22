import { useRef } from 'react'
import BaseMaterial from '../materials/BaseMaterial.jsx'
import { useControls } from 'leva'

export default function BasePlane() 
{
  const self = useRef()

  const { transitionProgress, cursorRadius } = useControls({
    transitionProgress:
    {
      label: 'Base Reveal',
      value: 1,
      min: 0,
      max: 1,
      step: 0.01
    },
    cursorRadius:
    {
      label: 'Cursor Radius',
      value: 0.22,
      min: 0.05,
      max: 0.6,
      step: 0.01
    }
  })

  return (
    <mesh ref={ self } >
        <planeGeometry
            args={ [ 7, 7, 64, 64 ] }
        />
        <BaseMaterial revealProgress={ transitionProgress } cursorRadius={ cursorRadius } />
    </mesh>
  )
}

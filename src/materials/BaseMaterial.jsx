import { shaderMaterial, useTexture } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import vertex from '../shaders/vertex.glsl'
import fragment from '../shaders/fragment.glsl'
import { RepeatWrapping, Vector2 } from 'three'

// Created once at module level (previously rebuilt on every render / mouse move)
const BaseMaterialImpl = shaderMaterial(
    {
        uTime: 0,
        uNoiseTexture: null,
        uResolution: new Vector2( 1, 1 ),
        uOniHelmetTexture: null,
        uOniPersonTexture: null,
        uOniMaskTexture: null,
        uDepthTexture: null,
        uMouse: new Vector2( 0, 0 ),
        uMouseUv: new Vector2( 0.5, 0.5 ),
        uCursorActive: 0,
        uRadius: 0.22,
        uProgress: 1,
    },
    vertex,
    fragment
)

extend( { BaseMaterialImpl } )

export default function BaseMaterial( {
    texture = './textures/noise/noiseValueSoft.png',
    helmetTexture = './images/onihelmet.png',
    personTexture = './images/onimain.png',
    depthTexture = './images/onidepth.png',
    maskTexture = './images/onimask.png',
    revealProgress = 1,
    cursorRadius = 0.22,
    parallax = 0.02,
    planeSize = 7,
    ...props
} )
{
    const self = useRef()
    const moved = useRef( false )
    const lastPointer = useRef( { x: 0, y: 0 } )
    const target = useRef( new Vector2( 0.5, 0.5 ) )

    const noise = useTexture( texture )
    noise.wrapS = RepeatWrapping
    noise.wrapT = RepeatWrapping

    const textureOniHelmet = useTexture( helmetTexture )
    const textureOniPerson = useTexture( personTexture )
    const textureOniMask = useTexture( maskTexture )
    const textureOniDepth = useTexture( depthTexture )

    useFrame( ( state, delta ) =>
    {
        const u = self.current.uniforms
        const { pointer, viewport, size } = state

        u.uTime.value += delta
        u.uResolution.value.set( size.width, size.height )

        // has the cursor moved at all yet?
        if ( pointer.x !== lastPointer.current.x || pointer.y !== lastPointer.current.y )
        {
            moved.current = true
            lastPointer.current.x = pointer.x
            lastPointer.current.y = pointer.y
        }

        // pointer (NDC) -> plane UV (plane sits at z = 0, viewport is in world units)
        target.current.set(
            ( pointer.x * viewport.width * 0.5 ) / planeSize + 0.5,
            ( pointer.y * viewport.height * 0.5 ) / planeSize + 0.5
        )

        // smooth follow (frame-rate independent)
        const k = 1 - Math.exp( -delta * 8 )
        u.uMouseUv.value.lerp( target.current, k )

        // fade reveal in once the user starts moving
        const active = moved.current ? 1 : 0
        u.uCursorActive.value += ( active - u.uCursorActive.value ) * ( 1 - Math.exp( -delta * 4 ) )

        // subtle parallax from the depth map
        u.uMouse.value.x += ( -pointer.x * parallax - u.uMouse.value.x ) * k
        u.uMouse.value.y += ( -pointer.y * parallax - u.uMouse.value.y ) * k

        u.uProgress.value = revealProgress
        u.uRadius.value = cursorRadius
    })

    return (
        <baseMaterialImpl
            ref={ self }
            uNoiseTexture={ noise }
            uOniHelmetTexture={ textureOniHelmet }
            uOniPersonTexture={ textureOniPerson }
            uOniMaskTexture={ textureOniMask }
            uDepthTexture={ textureOniDepth }
            {...props}
        />
    )
}

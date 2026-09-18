import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function FloatingDocument() {
  const groupRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.3
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.15
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[1.4, 1.9, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.5, 0.03]}>
        <planeGeometry args={[0.9, 0.08]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0, 0.25, 0.03]}>
        <planeGeometry args={[1.1, 0.06]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 0.05, 0.03]}>
        <planeGeometry args={[1.1, 0.06]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, -0.15, 0.03]}>
        <planeGeometry args={[0.7, 0.06]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
    </group>
  )
}

function Particles() {
  const particlesRef = useRef()
  const count = 40

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 6
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3
  }

  useFrame((state) => {
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#5eead4" size={0.05} sizeAttenuation transparent opacity={0.6} />
    </points>
  )
}

function HeroVisual3D() {
  return (
    <div className="h-80 w-full">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} intensity={0.8} />
        <pointLight position={[-3, -2, 2]} intensity={0.4} color="#f97316" />
        <FloatingDocument />
        <Particles />
      </Canvas>
    </div>
  )
}

export default HeroVisual3D
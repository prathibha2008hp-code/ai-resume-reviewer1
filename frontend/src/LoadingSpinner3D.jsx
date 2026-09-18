import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function SpinningTorus() {
  const meshRef = useRef()

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 1.5
    meshRef.current.rotation.y += delta * 2
  })

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[0.6, 0.25, 16, 32]} />
      <meshStandardMaterial color="#2563eb" />
    </mesh>
  )
}

function LoadingSpinner3D() {
  return (
    <div style={{ height: '120px', width: '120px' }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 3]} />
        <SpinningTorus />
      </Canvas>
    </div>
  )
}

export default LoadingSpinner3D

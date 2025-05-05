// solana-world-explorer: with filters, hover cards, external links, search and sort panel

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import { useRef, useState } from 'react';
import useProtocolData from './hooks/useProtocolData.js';

function GlowingMesh({ position, geometry, color, label, tvl, category, activeCategories, url }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  if (!activeCategories.includes(category)) return null;

  const scaleFactor = tvl ? Math.min(1 + tvl / 100_000_000, 3) : 1;

  useFrame(() => {
    const time = Date.now() * 0.002;
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(time) * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scaleFactor, scaleFactor, scaleFactor]}
      castShadow
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {geometry}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      <Html position={[0, 1.5 * scaleFactor, 0]} center>
        <div className="text-white text-sm font-bold text-center">
          {label}<br />
          {tvl ? `$${(tvl / 1e6).toFixed(2)}M TVL` : 'Loading...'}
        </div>
      </Html>
      {hovered && (
        <Html position={[0, 2.5 * scaleFactor, 0]} center>
          <div className="bg-white/90 rounded p-2 text-xs text-black shadow-md w-44">
            <strong>{label}</strong><br />
            Category: {category}<br />
            TVL: {tvl ? `$${tvl.toLocaleString()}` : '...'}<br />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-blue-600 underline"
            >
              Visit site
            </a>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default function SolanaWorldExplorer() {
  const { jupiter, tensor, helium } = useProtocolData();
  const [activeCategories, setActiveCategories] = useState(['DeFi', 'NFT', 'DePIN']);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const protocols = [
    {
      label: 'Jupiter', color: '#14f195', position: [-8, 1, 0], geometry: <boxGeometry args={[2, 2, 2]} />, tvl: jupiter?.tvl, category: 'DeFi', url: 'https://jup.ag'
    },
    {
      label: 'Tensor', color: '#9b59b6', position: [0, 1, 0], geometry: <cylinderGeometry args={[1.2, 1.2, 2, 32]} />, tvl: tensor?.tvl, category: 'NFT', url: 'https://www.tensor.trade'
    },
    {
      label: 'Helium', color: '#e67e22', position: [8, 1.5, 0], geometry: <coneGeometry args={[1.5, 3, 32]} />, tvl: helium?.tvl, category: 'DePIN', url: 'https://www.helium.com'
    }
  ];

  const filtered = protocols
    .filter(p => activeCategories.includes(p.category))
    .filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'tvl') return (b.tvl || 0) - (a.tvl || 0);
      return a.label.localeCompare(b.label);
    });

  return (
    <div className="h-screen w-screen bg-black">
      {/* UI Panel */}
      <div className="absolute top-4 left-4 z-10 space-y-2 bg-gray-900/80 p-4 rounded-md text-white w-64">
        <div className="space-x-1">
          {['DeFi', 'NFT', 'DePIN'].map((cat) => (
            <button
              key={cat}
              className={`px-3 py-1 rounded text-sm font-semibold ${
                activeCategories.includes(cat)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          className="w-full mt-2 px-2 py-1 rounded bg-gray-800 text-white text-sm"
          placeholder="Search protocol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="w-full mt-2 px-2 py-1 rounded bg-gray-800 text-white text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="tvl">Sort by TVL</option>
        </select>
      </div>

      <Canvas camera={{ position: [0, 10, 20], fov: 50 }} shadows>
        <ambientLight intensity={0.4} />
        <spotLight position={[15, 20, 5]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={2} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#0e0e0e" />
        </mesh>

        {filtered.map((p, i) => (
          <GlowingMesh
            key={i}
            position={p.position}
            geometry={p.geometry}
            color={p.color}
            label={p.label}
            tvl={p.tvl}
            category={p.category}
            activeCategories={activeCategories}
            url={p.url}
          />
        ))}

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}


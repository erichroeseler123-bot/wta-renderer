'use client';

export default function DCCPortMap() {
  return (
    <div
      style={{
        height: '70vh',
        border: '4px solid yellow',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img
        src="https://tile.openstreetmap.org/5/5/12.png"
        alt="OSM tile test"
        style={{
          width: 512,
          height: 512,
          border: '4px solid lime'
        }}
        onLoad={() => console.log('✅ OSM TILE LOADED')}
        onError={(e) => console.error('❌ OSM TILE FAILED', e)}
      />
    </div>
  );
}

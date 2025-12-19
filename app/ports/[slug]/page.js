export default function Page({ params }) {
  return (
    <div style={{ background: 'purple', height: '100vh', color: 'white', fontSize: 32 }}>
      PORT PAGE OK — {params.slug}
    </div>
  );
}

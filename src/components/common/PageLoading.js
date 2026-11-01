export default function PageLoading({ label = 'Loading…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        maxWidth: 1240,
        margin: '0 auto',
        padding: '96px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        color: '#5C6B62',
        fontSize: 14,
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          border: '3px solid #E3DCCB',
          borderTopColor: '#0B3D2E',
          display: 'block',
          animation: 'rooteco-spin 0.8s linear infinite',
        }}
      />
      <style>{'@keyframes rooteco-spin { to { transform: rotate(360deg); } }'}</style>
      {label}
    </div>
  );
}

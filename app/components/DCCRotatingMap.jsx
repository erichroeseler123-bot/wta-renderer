export default function DCCRotatingMap({ slug }) {
  return (
    <section style={styles.wrap}>
      <iframe
        src={`https://destinationcommandcenter.com/embed/map?port=${slug}`}
        style={styles.iframe}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </section>
  );
}

const styles = {
  wrap: {
    width: '100%',
    height: '420px',
    borderTop: '1px solid #1f2430',
    borderBottom: '1px solid #1f2430',
    background: '#000',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
};

import "./hud-demo.css";

export default function HudDemoPage() {
  return (
    <div className="hudBody">
      <div className="hud-frame">
        <div className="visual-monitor">
          <div className="target-reticle" />
          <div className="visual-label">ALASKA PORT OVERLAY // LOCKED VIEW</div>
        </div>

        <div className="data-sidebar">
          <div className="port-section">
            <div className="port-title">JUNEAU</div>
            <div className="data-point"><span>Cruise Dock Terminal</span> <span className="status-tag">PORT</span></div>
            <div className="data-point"><span>Downtown Juneau</span> <span className="status-tag">CORE</span></div>
            <div className="data-point"><span>Mendenhall Glacier</span> <span className="status-tag">WATER</span></div>
          </div>

          <div className="port-section">
            <div className="port-title">SKAGWAY</div>
            <div className="data-point"><span>White Pass Railway</span> <span className="status-tag">HISTORIC</span></div>
            <div className="data-point"><span>Museum & Archives</span> <span className="status-tag">CULTURE</span></div>
          </div>

          <div className="port-section">
            <div className="port-title">KETCHIKAN</div>
            <div className="data-point"><span>Totem Heritage Center</span> <span className="status-tag">WILDERNESS</span></div>
            <div className="data-point"><span>Misty Fjords NM</span> <span className="status-tag">NATURE</span></div>
            <div className="data-point"><span>Lumberjack Show</span> <span className="status-tag">ENTERTAINMENT</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

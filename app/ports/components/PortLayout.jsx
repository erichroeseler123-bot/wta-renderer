"use client";

export default function PortLayout({ map, children }) {
  return (
    <div className="port-layout">
      <div className="port-map">
        {map}
      </div>
      <div className="port-content">
        {children}
      </div>
    </div>
  );
}

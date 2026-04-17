import React from 'react';
import IssueMap from '../components/map/IssueMap';

const MapPage = () => (
  <div style={{ padding: '24px 24px 0' }}>
    <h2 style={{ marginBottom: 16 }}>🗺️ City Issues Map</h2>
    <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13 }}>
      <span><span style={{ color: '#e94560', fontWeight: 700 }}>●</span> Reported</span>
      <span><span style={{ color: '#f39c12', fontWeight: 700 }}>●</span> In Progress</span>
      <span><span style={{ color: '#27ae60', fontWeight: 700 }}>●</span> Resolved</span>
      <span style={{ color: '#888' }}>· Larger pins = higher urgency</span>
    </div>
    <IssueMap height="calc(100vh - 160px)" />
  </div>
);

export default MapPage;

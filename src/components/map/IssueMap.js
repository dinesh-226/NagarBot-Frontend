import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import useSocket from '../../hooks/useSocket';

const pinColor = (status) => {
  if (status === 'resolved') return '#27ae60';
  if (status === 'in-progress') return '#f39c12';
  return '#e94560';
};

const makeIcon = (color, urgency = 5) => {
  const size = urgency >= 8 ? 18 : 14;
  const pulse = urgency >= 8 ? `box-shadow:0 0 0 4px ${color}44,0 0 8px ${color}88;` : `box-shadow:0 0 4px rgba(0,0,0,.4);`;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;${pulse}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const IssueMap = ({ height = '500px' }) => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get('/issues').then(({ data }) => setIssues(data));
  }, []);

  useSocket('issue:new', (issue) => setIssues((prev) => [issue, ...prev]));
  useSocket('issue:updated', (updated) =>
    setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
  );

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height, width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {issues.filter((issue) => issue.location?.lat && issue.location?.lng).map((issue) => (
        <Marker key={`${issue._id}-${issue.status}`} position={[issue.location.lat, issue.location.lng]} icon={makeIcon(pinColor(issue.status), issue.urgency)}>
          <Popup>
            <strong>{issue.title}</strong><br />
            Category: {issue.category}<br />
            Urgency: {issue.urgency}/10<br />
            Status: <span style={{ color: pinColor(issue.status), fontWeight: 600 }}>{issue.status}</span><br />
            Dept: {issue.department}<br />
            {issue.refNumber && <span style={{ fontSize: 11, color: '#888' }}>{issue.refNumber}</span>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default IssueMap;

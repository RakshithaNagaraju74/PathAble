import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  FeatureGroup
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

// Fix for marker icon issue
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
});

const reportIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ManagedLocationsMap = ({ ngoZones = [], reports = [], onZoneCreate, isPointInPolygonWrapper }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const defaultZoom = 5;
  const mapRef = useRef();
  const featureGroupRef = useRef();

  const calculateBounds = () => {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    let hasData = false;

    ngoZones.forEach(zone => {
      zone.coordinates.forEach(coord => {
        minLat = Math.min(minLat, coord[0]);
        maxLat = Math.max(maxLat, coord[0]);
        minLng = Math.min(minLng, coord[1]);
        maxLng = Math.max(maxLng, coord[1]);
        hasData = true;
      });
    });

    reports.forEach(r => {
      const lat = Number(r.latitude);
      const lng = Number(r.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        hasData = true;
      }
    });

    if (!hasData) return null;
    return L.latLngBounds([[minLat, minLng], [maxLat, maxLng]]);
  };

  useEffect(() => {
    const bounds = calculateBounds();
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ngoZones, reports]);

  const handleCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const coords = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
      onZoneCreate(coords);
    }
  };

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            draw={{
              rectangle: false,
              circle: false,
              polyline: false,
              circlemarker: false,
              marker: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#e10000',
                  message: 'Polygons cannot intersect!'
                },
                shapeOptions: {
                  color: '#FF8C00',
                  fillColor: '#FF8C00',
                  fillOpacity: 0.2
                }
              }
            }}
            edit={{
              featureGroup: featureGroupRef.current,
              remove: true,
              edit: true
            }}
          />
        </FeatureGroup>

        {ngoZones.map((zone) => (
          <Polygon
            key={zone._id}
            positions={zone.coordinates}
            pathOptions={{ color: 'purple', fillOpacity: 0.2 }}
          >
            <Popup>
              <strong>Zone: {zone.name}</strong><br />
              Reports: {
                reports.filter(r => {
                  const lat = Number(r.latitude);
                  const lng = Number(r.longitude);
                  return isPointInPolygonWrapper(lat, lng, zone.coordinates);
                }).length
              }
            </Popup>
          </Polygon>
        ))}

        {reports.map((r) => {
          const lat = Number(r.latitude);
          const lng = Number(r.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={r._id} position={[lat, lng]} icon={reportIcon}>
              <Popup>
                <strong>{r.placeName || 'Unknown Place'}</strong><br />
                Type: {r.type}<br />
                Comment: {r.comment}<br />
                User: {r.userName || 'Anonymous'}<br />
                {r.verifiedByNgos?.length > 0 && (
                  <span>Verified by {r.verifiedByNgos.length} NGO(s)</span>
                )}
                {r.imageUrl && (
                  <img src={r.imageUrl} alt="report" style={{ maxWidth: '100px', marginTop: '5px' }} />
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ManagedLocationsMap;

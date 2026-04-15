import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Story } from '../types';
import { CATEGORIES, MAP_CENTER, DEFAULT_ZOOM } from '../constants';
import { MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface MapProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onMapClick: (lat: number, lng: number) => void;
  selectedStoryId?: string;
}

const createCustomIcon = (story: Story) => {
  const { category, authorImage } = story;
  const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  const iconHtml = renderToString(
    <div className="relative flex items-center justify-center">
      {authorImage ? (
        <img
          src={authorImage}
          alt="Story author"
          className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          style={{ backgroundColor: cat.color }}
        >
          <MapPin className="w-5 h-5 text-white" />
        </div>
      )}
      <div 
        className="absolute -bottom-1 w-2 h-2 rotate-45"
        style={{ backgroundColor: cat.color }}
      />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Map({ stories, onSelectStory, onMapClick, selectedStoryId }: MapProps) {
  return (
    <MapContainer 
      center={MAP_CENTER} 
      zoom={DEFAULT_ZOOM} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
   url="https://mt1.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}"
      />
      
      {stories.map((story) => (
        <Marker 
          key={story.id} 
          position={[story.latitude, story.longitude]}
          icon={createCustomIcon(story)}
          eventHandlers={{
            click: () => onSelectStory(story),
          }}
        >
          <Popup>
            <div className="p-3 w-72 max-w-[85vw]">
              <h3 className="font-bold text-lg mb-1">{story.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{story.content}</p>
              {/* <button 
                onClick={() => onSelectStory(story)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Read more
              </button> */}
            </div>
          </Popup>
        </Marker>
      ))}

      <MapEvents onMapClick={onMapClick} />
    </MapContainer>
  );
}

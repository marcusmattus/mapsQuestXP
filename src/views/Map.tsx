import React, { useState, useEffect, useCallback, useRef } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useAuth } from '../hooks/useAuth';
import { useXP } from '../hooks/useXP';
import { db } from '../firebase';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { Place } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, CheckCircle2, X, Info, Zap, Search, Crosshair } from 'lucide-react';

const MAP_ID = "DEMO_MAP_ID";

const PlaceAutocomplete = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void }) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    setAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!autocomplete) return;

    autocomplete.addListener('place_changed', () => {
      onPlaceSelect(autocomplete.getPlace());
    });
  }, [autocomplete, onPlaceSelect]);

  return (
    <div className="relative w-full max-w-md pointer-events-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
        <Search size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Find a destination..."
        className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
      />
    </div>
  );
};

const Markers = ({ places, onPlaceClick }: { places: Place[], onPlaceClick: (place: Place) => void }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    const newMarkers: { [key: string]: google.maps.Marker } = {};

    places.forEach((place) => {
      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: place.name,
      });

      marker.addListener('click', () => {
        onPlaceClick(place);
      });

      newMarkers[place.id] = marker;
    });

    setMarkers(newMarkers);
    clusterer.current?.addMarkers(Object.values(newMarkers));

    return () => {
      clusterer.current?.clearMarkers();
      Object.values(newMarkers).forEach(m => m.setMap(null));
    };
  }, [places, map, onPlaceClick]);

  return null;
};

const MapContent = ({ 
  userLocation, 
  places, 
  setSelectedPlace,
  profile,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories
}: { 
  userLocation: google.maps.LatLngLiteral | null, 
  places: Place[], 
  setSelectedPlace: (place: Place) => void,
  profile: any,
  searchQuery: string,
  setSearchQuery: (query: string) => void,
  selectedCategory: string | null,
  setSelectedCategory: (category: string | null) => void,
  categories: string[]
}) => {
  const map = useMap();

  const centerOnUser = () => {
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(15);
    }
  };

  return (
    <>
      <Map
        defaultCenter={userLocation || { lat: 40.7128, lng: -74.0060 }}
        defaultZoom={15}
        mapId={MAP_ID}
        className="w-full h-full"
        disableDefaultUI={true}
      >
        {userLocation && window.google && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
          />
        )}

        <Markers places={places} onPlaceClick={setSelectedPlace} />
      </Map>

      {/* No Results Indicator */}
      {places.length === 0 && (searchQuery || selectedCategory) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center gap-3 z-50">
          <div className="bg-gray-100 p-4 rounded-full text-gray-400">
            <Search size={32} />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900">No locations found</p>
            <p className="text-xs text-gray-500">Try adjusting your filters</p>
          </div>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Search & Filters Overlay */}
      <div className="absolute top-24 left-6 right-6 flex flex-col gap-4 pointer-events-none">
        <div className="flex flex-col gap-3">
          {/* Google Places Search */}
          <MapSearch onPlaceSelect={(loc) => {}} places={places} setSelectedPlace={setSelectedPlace} />
          
          {/* Game Places Filter */}
          <div className="relative w-full max-w-md pointer-events-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter game locations..."
              className="w-full pl-10 pr-4 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 font-medium"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar pointer-events-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                !selectedCategory 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Info & Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {profile?.level}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Current XP</p>
              <p className="font-black text-gray-900 leading-tight">{profile?.xp}</p>
            </div>
          </div>
        </div>

        {/* Visible Locations Count */}
        {(searchQuery || selectedCategory) && (
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg border border-blue-500/20 pointer-events-auto flex items-center gap-2">
            <MapPin size={12} />
            <span className="text-[10px] font-black uppercase">{places.length} Found</span>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="ml-1 p-0.5 hover:bg-white/20 rounded-full"
            >
              <X size={10} />
            </button>
          </div>
        )}
        
        <div className="flex flex-col gap-3 pointer-events-auto">
          <button 
            onClick={centerOnUser}
            className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 text-blue-600 hover:bg-white transition-colors"
          >
            <Crosshair size={24} />
          </button>
          <button className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 text-blue-600">
            <Info size={24} />
          </button>
        </div>
      </div>
    </>
  );
};

// Separate search component to use useMap
const MapSearch = ({ onPlaceSelect, places, setSelectedPlace }: { 
  onPlaceSelect: (location: google.maps.LatLngLiteral) => void,
  places: Place[],
  setSelectedPlace: (place: Place) => void
}) => {
  const map = useMap();
  
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry || !place.geometry.location || !map) return;

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    map.panTo(location);
    map.setZoom(17);

    // Check if this is one of our game places
    const existingPlace = places.find(p => 
      Math.abs(p.lat - location.lat) < 0.0001 && 
      Math.abs(p.lng - location.lng) < 0.0001
    );

    if (existingPlace) {
      setSelectedPlace(existingPlace);
    } else {
      // Create a temporary "destination" place
      setSelectedPlace({
        id: 'temp-' + Date.now(),
        name: place.name || 'Selected Destination',
        category: 'Destination',
        lat: location.lat,
        lng: location.lng,
        rewardXP: 100,
        rewardPoints: 10,
        radius: 50,
        description: place.formatted_address || 'A custom destination you found.'
      } as Place);
    }
    
    onPlaceSelect(location);
  };

  return <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />;
};

const MapView = () => {
  const { user, profile } = useAuth();
  const { addXP } = useXP();
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const categories = Array.from(new Set(places.map(p => p.category))) as string[];

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Fetch places
  useEffect(() => {
    const fetchPlaces = async () => {
      const querySnapshot = await getDocs(collection(db, 'places'));
      const fetchedPlaces = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
      
      if (fetchedPlaces.length === 0) {
        // Add some dummy places if empty
        const dummyPlaces = [
          { id: 'p1', name: "Central Park Hub", category: "Nature", lat: 40.785091, lng: -73.968285, rewardXP: 500, rewardPoints: 50, radius: 100, description: "A beautiful spot in the heart of the city." },
          { id: 'p2', name: "Tech Museum", category: "Education", lat: 40.758896, lng: -73.985130, rewardXP: 750, rewardPoints: 75, radius: 50, description: "Explore the latest in technology and innovation." },
          { id: 'p3', name: "Gourmet Plaza", category: "Food", lat: 40.748441, lng: -73.985664, rewardXP: 300, rewardPoints: 30, radius: 30, description: "The best street food in town." },
          // Extra dummy places for clustering demo
          { id: 'p4', name: "Empire State Building", category: "Landmark", lat: 40.748441, lng: -73.985664, rewardXP: 1000, rewardPoints: 100, radius: 50, description: "Iconic skyscraper." },
          { id: 'p5', name: "Bryant Park", category: "Nature", lat: 40.753596, lng: -73.983232, rewardXP: 400, rewardPoints: 40, radius: 80, description: "Urban oasis." },
          { id: 'p6', name: "Grand Central", category: "Landmark", lat: 40.752726, lng: -73.977229, rewardXP: 600, rewardPoints: 60, radius: 60, description: "Historic terminal." },
          { id: 'p7', name: "Public Library", category: "Education", lat: 40.753182, lng: -73.982253, rewardXP: 500, rewardPoints: 50, radius: 40, description: "Knowledge hub." },
        ];
        // Note: In a real app, you'd add these via admin panel or script
        setPlaces(dummyPlaces as any);
      } else {
        setPlaces(fetchedPlaces);
      }
    };
    fetchPlaces();
  }, []);

  // Track user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const calculateDistance = (p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral) => {
    const R = 6371e3; // metres
    const φ1 = p1.lat * Math.PI/180;
    const φ2 = p2.lat * Math.PI/180;
    const Δφ = (p2.lat-p1.lat) * Math.PI/180;
    const Δλ = (p2.lng-p1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  const handleCheckIn = async () => {
    if (!user || !selectedPlace || !userLocation) return;
    
    const distance = calculateDistance(userLocation, { lat: selectedPlace.lat, lng: selectedPlace.lng });
    
    if (distance > selectedPlace.radius) {
      alert(`You are too far away! Move closer to ${selectedPlace.name} to check in.`);
      return;
    }

    setCheckingIn(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'checkins'), {
        placeId: selectedPlace.id,
        placeName: selectedPlace.name,
        timestamp: Timestamp.now(),
        xpAwarded: selectedPlace.rewardXP
      });
      
      await addXP(selectedPlace.rewardXP);
      setCheckInSuccess(true);
      setTimeout(() => {
        setCheckInSuccess(false);
        setSelectedPlace(null);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="h-screen w-full relative">
      <APIProvider 
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
        onLoad={() => console.log('Google Maps API loaded successfully')}
        onError={(err) => {
          console.error('Google Maps API failed to load:', err);
          if (err.toString().includes('ApiNotActivatedMapError')) {
            alert('Google Maps API Error: The "Maps JavaScript API" is not enabled for your API key. Please enable it in the Google Cloud Console.');
          }
        }}
        libraries={['places']}
      >
        <MapContent 
          userLocation={userLocation} 
          places={filteredPlaces} 
          setSelectedPlace={setSelectedPlace}
          profile={profile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
      </APIProvider>

      {/* Place Detail Overlay */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-24 left-4 right-4 bg-white rounded-3xl shadow-2xl p-6 z-40 border border-gray-100"
          >
            <button 
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {selectedPlace.category}
              </span>
              <span className="text-gray-400 text-xs">• {selectedPlace.radius}m Radius</span>
            </div>

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{selectedPlace.name}</h2>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`, '_blank')}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                title="Navigate with Google Maps"
              >
                <Navigation size={20} />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{selectedPlace.description}</p>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-blue-50 p-3 rounded-2xl flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Reward</p>
                  <p className="text-lg font-black text-blue-900">{selectedPlace.rewardXP} XP</p>
                </div>
              </div>
              <div className="flex-1 bg-green-50 p-3 rounded-2xl flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg text-white">
                  <Navigation size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-green-600 font-bold uppercase">Distance</p>
                  <p className="text-lg font-black text-green-900">
                    {userLocation ? Math.round(calculateDistance(userLocation, { lat: selectedPlace.lat, lng: selectedPlace.lng })) : '??'}m
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={checkingIn || checkInSuccess}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                checkInSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {checkingIn ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : checkInSuccess ? (
                <>
                  <CheckCircle2 size={24} />
                  Checked In!
                </>
              ) : (
                <>
                  <MapPin size={24} />
                  Check In
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapView;

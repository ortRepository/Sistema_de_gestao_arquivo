import '@geoman-io/leaflet-geoman-free';
import { type LatLng, type Layer, type Map } from 'leaflet';

declare module 'leaflet' {
  interface Map {
    pm: {
      addControls: (options: any) => void;
    };
  }

  interface Layer {
    pm: {
      enable: (options?: any) => void;
      disable: () => void;
    };
  }

  interface Polyline {
    getLatLngs: () => LatLng[] | LatLng[][] | LatLng[][][];
  }
}
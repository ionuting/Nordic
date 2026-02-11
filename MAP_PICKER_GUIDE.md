# Map Location Picker - Ghid de Utilizare

## Prezentare Generală

Funcționalitatea **Map Picker** permite selectarea interactivă a locației pentru orders direct pe o hartă, eliminând necesitatea introducerii manuale a coordonatelor GPS.

## Tehnologii Folosite

- **Leaflet 1.9.4** - Biblioteca JavaScript pentru hărți interactive
- **react-leaflet 4.2.1** - React wrapper pentru Leaflet (compatibil cu React 18)
- **OpenStreetMap** - Tile provider gratuit pentru hărți
- **Nominatim API** - Reverse geocoding pentru obținerea adresei din coordonate

## Cum Funcționează

### 1. Deschidere Map Picker

În orice **OrderNode**, găsești câmpul "📍 Location" cu un buton **🗺️ Map**.

```
┌─────────────────────────────────┐
│ 📍 Location: [Copenhagen...] [🗺️ Map] │
└─────────────────────────────────┘
```

Click pe butonul **Map** pentru a deschide harta interactivă în modal overlay.

### 2. Selectare Locație

- **Click pe hartă** oriunde pentru a seta un marker
- Coordonatele se actualizează instant în panoul de sus
- **Reverse geocoding automat** - adresa apare sub coordonate
- Poți muta markerul făcând click într-o altă locație

```
┌──────────────────────────────────────┐
│ 📍 Select Location on Map         ✕ │
├──────────────────────────────────────┤
│ Coordinates: 55.676098, 12.568337    │
│ Address: Rådhuspladsen 1, Copenhagen │
│ Click on the map to select a location│
├──────────────────────────────────────┤
│        [Hartă interactivă]           │
│                                       │
├──────────────────────────────────────┤
│          [Cancel] [✓ Confirm Location]│
└──────────────────────────────────────┘
```

### 3. Confirmare Locație

- Click **✓ Confirm Location** pentru a salva
- Adresa se completează automat în câmpul Location
- Coordonatele se salvează în Order:
  - `location_latitude` (double precision)
  - `location_longitude` (double precision)
  - `location` (text - adresa completă)

### 4. Anulare

- Click **Cancel** sau **✕** pentru a închide harta fără modificări

## Date Salvate în Database

Când confirmi o locație, următoarele câmpuri se actualizează în tabelul `Orders`:

```sql
{
  "order_number": "ORD-001",
  "location": "Rådhuspladsen 1, 1550 København, Danmark",
  "location_latitude": 55.676098,
  "location_longitude": 12.568337,
  ...
}
```

## Funcționalități Avansate

### Coordonate de Precizie

Coordonatele sunt salvate cu **6 decimale** (±0.11 metri precizie):
- Format: `55.676098, 12.568337`
- Afișare în OrderNode: `Coords: 55.676098, 12.568337`

### Reverse Geocoding

Serviciul **Nominatim** transformă coordonatele în adresă:
- Automat la fiecare click pe hartă
- Loading state vizibil
- Fallback la coordonate dacă API-ul nu răspunde

### Centrare Inițială

Harta se centrează automat pe:
1. **Coordonatele existente** ale order-ului (dacă există)
2. **Copenhaga** (55.6761, 12.5683) - default pentru orders noi

### Zoom și Navigare

- **Zoom**: Scroll mouse sau butoane +/- din hartă
- **Pan**: Drag pe hartă pentru mutare
- **Zoom level default**: 13 (nivel oraș)

## Integrare în Componente

### OrderNode.tsx

```typescript
const [showMapPicker, setShowMapPicker] = useState(false);

const handleLocationSelect = (lat: number, lng: number, address: string) => {
  setLocation(address);
  onUpdate({ 
    ...order, 
    location: address,
    locationLatitude: lat,
    locationLongitude: lng
  });
  setShowMapPicker(false);
};

// Render
{showMapPicker && (
  <MapPicker
    initialLat={order.locationLatitude}
    initialLng={order.locationLongitude}
    onLocationSelect={handleLocationSelect}
    onClose={() => setShowMapPicker(false)}
  />
)}
```

### MapPicker Props

```typescript
interface MapPickerProps {
  initialLat?: number;          // Default: 55.6761 (Copenhagen)
  initialLng?: number;          // Default: 12.5683
  onLocationSelect: (
    lat: number, 
    lng: number, 
    address: string
  ) => void;
  onClose: () => void;
}
```

## Styling

### Nordic Maskin Brand Colors

MapPicker folosește paleta oficială:
- **Primary**: `#125c5c` (teal green)
- **Primary Dark**: `#0d4545`
- **Primary Hover**: `#158080`

### Responsive Design

- **Width**: 90% din viewport, max 900px
- **Height**: 80vh, max 700px
- **Mobile-friendly**: Adaptat pentru ecrane mici
- **Animations**: Fade-in și slide-up pentru modal

## API Endpoints

### OpenStreetMap Tiles

```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Nominatim Reverse Geocoding

```
https://nominatim.openstreetmap.org/reverse?
  format=json
  &lat={latitude}
  &lon={longitude}
  &zoom=18
  &addressdetails=1
```

**Rate Limit**: 1 request/second (pentru usage fair)

## Exemple de Utilizare

### Exemplu 1: Order în Copenhagen

```
Location: "Rådhuspladsen 1, 1550 København, Danmark"
Coords: 55.676098, 12.568337
```

### Exemplu 2: Order în Odense

```
Location: "Odense Banegård, 5000 Odense C, Danmark"
Coords: 55.403756, 10.378628
```

### Exemplu 3: Order în Aarhus

```
Location: "Aarhus Hovedbanegård, 8000 Aarhus C, Danmark"
Coords: 56.150036, 10.204761
```

## Troubleshooting

### Harta nu se încarcă

**Problemă**: Tiles nu se afișează  
**Soluție**: Verifică conexiunea la internet și firewall settings

### Reverse geocoding eșuează

**Problemă**: Addresses ca "Loading..." sau doar coordonate  
**Soluție**: Rate limit la Nominatim - așteaptă câteva secunde și încearcă din nou

### Marker nu apare

**Problemă**: Click pe hartă nu setează marker  
**Soluție**: Verifică console pentru erori JavaScript

### Coordonatele nu se salvează

**Problemă**: După Confirm, coordonatele rămân default  
**Soluție**: Verifică că `onLocationSelect` callback este configurat corect

## Dependințe

```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@types/leaflet": "^1.9.8"
}
```

**Instalare**:

```powershell
cd typescript-app
npm install leaflet react-leaflet@4.2.1 @types/leaflet --legacy-peer-deps
```

**Notă**: `--legacy-peer-deps` este necesar pentru compatibilitate cu React 18.3.1 (react-leaflet 5.x cere React 19).

## CSS Import

Asigură-te că Leaflet CSS este importat în **MapPicker.tsx**:

```typescript
import 'leaflet/dist/leaflet.css';
```

## Îmbunătățiri Viitoare

- [ ] Căutare după adresă (forward geocoding)
- [ ] Salvare locații favorite
- [ ] Afișare multiple markers pe o hartă (overview)
- [ ] Drawing tools pentru zone/rute
- [ ] Offline maps caching
- [ ] Satellite view toggle
- [ ] Distance measurement tool

## License

MapPicker folosește:
- **Leaflet** - BSD 2-Clause License
- **OpenStreetMap** - Open Data Commons Open Database License (ODbL)
- **Nominatim** - Usage Policy (attribution required)

**Attribution**: Maps © OpenStreetMap contributors

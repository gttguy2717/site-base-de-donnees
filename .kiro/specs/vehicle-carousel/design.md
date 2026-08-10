# Design Document: Vehicle Carousel

## Introduction

This document outlines the technical design for implementing a horizontal vehicle carousel component for the Soutarah website. The carousel will display available vehicles (cars, vans, buses) with responsive layouts, smooth animations, accessibility features, and integration with the existing reservation system.

## Architecture Overview

### Component Structure

The vehicle carousel will be implemented as a modular React component architecture:

```
VehicleCarousel (Container)
├── VehicleCarouselTrack (Scrollable container)
│   └── VehicleCard[] (Individual vehicle items)
├── CarouselNavigation (Previous/Next buttons)
├── CarouselIndicators (Dot navigation)
└── CarReservationModal (Existing component)
```

### Technology Stack

- **Framework**: React 19.2.8 with functional components and hooks
- **Styling**: Tailwind CSS 3.4.17 with custom utility classes
- **Icons**: Material Symbols (already in use)
- **State Management**: React hooks (useState, useEffect, useRef, useCallback)
- **Touch Gestures**: Custom hook using native touch events
- **Lazy Loading**: Intersection Observer API
- **Accessibility**: ARIA attributes and keyboard navigation

## Component Design

### 1. VehicleCarousel (Main Component)

**Responsibility**: Orchestrate the entire carousel functionality, manage state, and coordinate child components.


**State Management**:
```javascript
const [currentIndex, setCurrentIndex] = useState(0);
const [vehicles, setVehicles] = useState([]);
const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
const [selectedVehicle, setSelectedVehicle] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const [visibleCards, setVisibleCards] = useState(3);
```

**Key Props**:
- `vehicles`: Array of vehicle objects
- `autoScrollInterval`: Number (default: 5000ms)
- `pauseDuration`: Number (default: 10000ms)
- `onVehicleReserve`: Callback function for analytics

**Hooks Used**:
- `useState`: Manage carousel state
- `useEffect`: Handle auto-scroll, viewport resize, data loading
- `useRef`: Reference DOM elements for scroll calculations
- `useCallback`: Memoize event handlers
- `useSwipeGesture`: Custom hook for touch interactions
- `useLazyLoad`: Custom hook for image lazy loading
- `useResponsiveCards`: Custom hook for viewport-based card count

### 2. VehicleCard Component

**Responsibility**: Display individual vehicle information with image, specifications, and reservation button.

**Props**:
```javascript
{
  vehicle: {
    id: string,
    name: string,
    category: 'car' | 'van' | 'bus',
    image: string,
    capacity: number,
    pricePerDay: number,
    specs: string[]
  },
  onReserve: (vehicle) => void,
  isLazyLoaded: boolean
}
```


**Structure** (JSX):
```jsx
<div className="relative group rounded-3xl overflow-hidden bg-white shadow-lg border border-gray-200 
                transition-all hover:shadow-xl">
  {/* Vehicle Image */}
  <div className="relative h-52 w-full overflow-hidden bg-surface-container">
    {isLazyLoaded ? (
      <img 
        src={vehicle.image} 
        alt={vehicle.name}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
        onError={handleImageError}
      />
    ) : (
      <div className="h-full w-full animate-pulse bg-gray-300" />
    )}
    <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full 
                     text-xs font-bold uppercase">
      {vehicle.category}
    </span>
  </div>
  
  {/* Vehicle Information */}
  <div className="p-5">
    <h3 className="font-display text-xl font-bold text-on-surface">{vehicle.name}</h3>
    
    {/* Specifications */}
    <div className="mt-3 flex flex-wrap gap-2">
      {vehicle.specs.map(spec => (
        <span key={spec} className="text-xs bg-surface-container px-2.5 py-1 rounded-full">
          {spec}
        </span>
      ))}
    </div>
    
    {/* Price and Action */}
    <div className="mt-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">À partir de</p>
        <p className="text-2xl font-bold text-primary">{vehicle.pricePerDay} FCFA<span className="text-sm font-normal">/jour</span></p>
      </div>
      <button 
        onClick={() => onReserve(vehicle)}
        className="bg-primary text-white px-5 py-2.5 rounded-full font-bold text-sm
                   hover:bg-on-primary-container active:scale-95 transition-all"
        aria-label={`Réserver ${vehicle.name}`}
      >
        Réserver
      </button>
    </div>
  </div>
</div>
```


### 3. CarouselNavigation Component

**Responsibility**: Provide previous/next navigation buttons with proper accessibility and disabled states.

**Props**:
```javascript
{
  onPrevious: () => void,
  onNext: () => void,
  canGoPrevious: boolean,
  canGoNext: boolean,
  isMobile: boolean
}
```

**Structure** (JSX):
```jsx
<>
  {/* Previous Button */}
  <button
    onClick={onPrevious}
    disabled={!canGoPrevious}
    aria-label="Véhicule précédent"
    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 
                h-11 w-11 rounded-full bg-white shadow-lg
                flex items-center justify-center
                transition-all hover:bg-surface-container
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isMobile ? 'hidden' : 'block'}`}
  >
    <span className="material-symbols-outlined">chevron_left</span>
  </button>
  
  {/* Next Button */}
  <button
    onClick={onNext}
    disabled={!canGoNext}
    aria-label="Véhicule suivant"
    className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 
                h-11 w-11 rounded-full bg-white shadow-lg
                flex items-center justify-center
                transition-all hover:bg-surface-container
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isMobile ? 'hidden' : 'block'}`}
  >
    <span className="material-symbols-outlined">chevron_right</span>
  </button>
</>
```


### 4. CarouselIndicators Component

**Responsibility**: Display position indicators and allow direct navigation to specific positions.

**Props**:
```javascript
{
  total: number,
  currentIndex: number,
  onIndicatorClick: (index: number) => void
}
```

**Structure** (JSX):
```jsx
<div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Navigation du carrousel">
  {Array.from({ length: total }).map((_, index) => (
    <button
      key={index}
      role="tab"
      aria-label={`Véhicule ${index + 1} sur ${total}`}
      aria-selected={index === currentIndex}
      onClick={() => onIndicatorClick(index)}
      className={`h-2.5 rounded-full transition-all
                  ${index === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
    />
  ))}
</div>
```

## Data Model

### Vehicle Data Structure

Vehicles will be stored in `/src/data/vehiclesData.js`:

```javascript
export const vehicles = [
  {
    id: 'vehicle-001',
    name: 'Toyota Corolla',
    category: 'car',
    image: '/images/vehicles/toyota-corolla.jpg',
    capacity: 5,
    pricePerDay: 25000,
    specs: ['5 places', 'Climatisation', 'Boîte auto']
  },
  {
    id: 'vehicle-002',
    name: 'Mercedes Sprinter',
    category: 'van',
    image: '/images/vehicles/mercedes-sprinter.jpg',
    capacity: 12,
    pricePerDay: 75000,
    specs: ['12 places', 'Climatisation', 'Grand coffre']
  },
  // ... more vehicles
];
```


## Custom Hooks

### useSwipeGesture

**Purpose**: Detect and handle touch swipe gestures on mobile devices.

**Implementation**:
```javascript
function useSwipeGesture(elementRef, { onSwipeLeft, onSwipeRight, threshold = 50 }) {
  useEffect(() => {
    if (!elementRef.current) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isDragging = true;
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      
      // Prevent vertical scroll if horizontal swipe is dominant
      if (deltaX > deltaY) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isDragging) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      
      if (Math.abs(deltaX) >= threshold) {
        if (deltaX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
      
      isDragging = false;
    };
    
    const element = elementRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, onSwipeLeft, onSwipeRight, threshold]);
}
```


### useResponsiveCards

**Purpose**: Calculate the number of visible cards based on viewport width.

**Implementation**:
```javascript
function useResponsiveCards() {
  const [visibleCards, setVisibleCards] = useState(3);
  
  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setVisibleCards(1); // Mobile
      } else if (width < 1024) {
        setVisibleCards(2); // Tablet
      } else {
        setVisibleCards(3); // Desktop
      }
    };
    
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);
  
  return visibleCards;
}
```

### useLazyLoad

**Purpose**: Lazy load images using Intersection Observer with a 500px rootMargin.

**Implementation**:
```javascript
function useLazyLoad(elementRef) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '500px'
      }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [elementRef]);
  
  return isVisible;
}
```


### useAutoScroll

**Purpose**: Manage automatic scrolling with pause functionality.

**Implementation**:
```javascript
function useAutoScroll({ 
  interval = 5000, 
  pauseDuration = 10000, 
  onNext, 
  isPaused 
}) {
  const [internalPause, setInternalPause] = useState(false);
  const timeoutRef = useRef(null);
  
  const pauseTemporarily = useCallback(() => {
    setInternalPause(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setInternalPause(false);
    }, pauseDuration);
  }, [pauseDuration]);
  
  useEffect(() => {
    if (isPaused || internalPause) return;
    
    const intervalId = setInterval(() => {
      onNext();
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [interval, onNext, isPaused, internalPause]);
  
  return { pauseTemporarily };
}
```

## State Management and Logic Flow

### Navigation Logic

**Next Navigation**:
```javascript
const handleNext = useCallback(() => {
  if (currentIndex < vehicles.length - visibleCards) {
    setCurrentIndex(prev => prev + 1);
    emitAnalyticsEvent('carousel_next', { currentIndex });
  } else if (isAutoScroll) {
    // Loop back to start during auto-scroll
    setCurrentIndex(0);
  }
  pauseAutoScroll();
}, [currentIndex, vehicles.length, visibleCards, isAutoScroll]);
```

**Previous Navigation**:
```javascript
const handlePrevious = useCallback(() => {
  if (currentIndex > 0) {
    setCurrentIndex(prev => prev - 1);
    emitAnalyticsEvent('carousel_previous', { currentIndex });
  }
  pauseAutoScroll();
}, [currentIndex]);
```


### Keyboard Navigation

**Arrow Key Handling**:
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (document.activeElement?.closest('.vehicle-carousel')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleNext, handlePrevious]);
```

### ARIA Live Region Updates

```javascript
const [liveRegionMessage, setLiveRegionMessage] = useState('');

useEffect(() => {
  const startIndex = currentIndex + 1;
  const endIndex = Math.min(currentIndex + visibleCards, vehicles.length);
  setLiveRegionMessage(
    `Affichage des véhicules ${startIndex} à ${endIndex} sur ${vehicles.length}`
  );
}, [currentIndex, visibleCards, vehicles.length]);
```

## Error Handling

### Image Load Errors

```javascript
const handleImageError = (e, vehicle) => {
  const placeholderIcons = {
    car: 'directions_car',
    van: 'airport_shuttle',
    bus: 'directions_bus'
  };
  
  e.target.style.display = 'none';
  const parent = e.target.parentElement;
  const placeholder = document.createElement('div');
  placeholder.className = 'h-full w-full flex items-center justify-center bg-surface-container';
  placeholder.innerHTML = `
    <span class="material-symbols-outlined text-6xl text-gray-400">
      ${placeholderIcons[vehicle.category]}
    </span>
  `;
  parent.appendChild(placeholder);
};
```


### Data Load Errors

```javascript
useEffect(() => {
  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await import('../data/vehiclesData.js');
      setVehicles(data.vehicles);
      setError(null);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      setError({
        message: 'Impossible de charger les véhicules',
        retry: loadVehicles
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  loadVehicles();
}, []);
```

### Error UI States

```javascript
// Loading State
if (isLoading) {
  return (
    <div className="flex justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-gray-600">Chargement des véhicules...</p>
      </div>
    </div>
  );
}

// Error State
if (error) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <span className="material-symbols-outlined text-5xl text-red-500">error</span>
      <p className="mt-3 font-bold text-red-800">{error.message}</p>
      <button 
        onClick={error.retry}
        className="mt-4 rounded-full bg-red-600 px-6 py-2.5 font-bold text-white hover:bg-red-700"
      >
        Réessayer
      </button>
    </div>
  );
}

// Empty State
if (vehicles.length === 0) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-surface p-8 text-center">
      <span className="material-symbols-outlined text-5xl text-gray-400">inventory_2</span>
      <p className="mt-3 font-bold text-gray-700">Aucun véhicule disponible pour le moment</p>
    </div>
  );
}
```


## Animation and Transitions

### Scroll Transitions

```css
/* Tailwind config extension or custom CSS */
.carousel-track {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .carousel-track {
    transition: none;
  }
}
```

### Card Animations

```jsx
// Fade-in animation for cards
<div className="opacity-0 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
  <VehicleCard vehicle={vehicle} />
</div>
```

Add to `index.css`:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 200ms ease-out forwards;
}
```

### Button Feedback

```jsx
// Active state scaling
className="... active:scale-95 transition-transform duration-100"
```

## Performance Optimization

### Memoization Strategy

```javascript
// Memoize expensive calculations
const maxScrollIndex = useMemo(() => 
  Math.max(0, vehicles.length - visibleCards), 
  [vehicles.length, visibleCards]
);

// Memoize callbacks
const handleReserve = useCallback((vehicle) => {
  setSelectedVehicle(vehicle);
  setIsAutoScrollPaused(true);
  emitAnalyticsEvent('vehicle_reserve_click', { vehicleId: vehicle.id });
}, []);
```


### Image Optimization

```javascript
// Request appropriately sized images based on device pixel ratio
const getOptimizedImageUrl = (baseUrl, width = 400) => {
  const dpr = window.devicePixelRatio || 1;
  const optimizedWidth = Math.round(width * dpr);
  
  // Assuming CDN supports width parameter
  return `${baseUrl}?w=${optimizedWidth}&q=80`;
};
```

### Debounced Resize Handler

```javascript
const useDebouncedResize = (callback, delay = 200) => {
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [callback, delay]);
};
```

## Accessibility Features

### Complete ARIA Implementation

```jsx
<div 
  className="vehicle-carousel"
  role="region"
  aria-label="Carrousel de véhicules disponibles"
  aria-roledescription="carousel"
  onMouseEnter={() => setIsAutoScrollPaused(true)}
  onMouseLeave={() => setIsAutoScrollPaused(false)}
>
  {/* Live region for screen reader announcements */}
  <div 
    aria-live="polite" 
    aria-atomic="true"
    className="sr-only"
  >
    {liveRegionMessage}
  </div>
  
  {/* Carousel content */}
  <div className="relative" tabIndex={0}>
    {/* Track with vehicles */}
  </div>
</div>
```

### Screen Reader Only Text

Add to `index.css`:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```


## Integration with Existing System

### Using CarReservationModal

```javascript
import CarReservationModal from './CarReservationModal';

// In VehicleCarousel component
const [selectedVehicle, setSelectedVehicle] = useState(null);

const handleCloseModal = () => {
  setSelectedVehicle(null);
  // Resume auto-scroll after 5 seconds
  setTimeout(() => {
    setIsAutoScrollPaused(false);
  }, 5000);
};

// Render modal
{selectedVehicle && (
  <CarReservationModal 
    vehicle={selectedVehicle}
    onClose={handleCloseModal}
  />
)}
```

### Analytics Events

```javascript
const emitAnalyticsEvent = (eventName, data) => {
  // Emit custom event for analytics tracking
  window.dispatchEvent(new CustomEvent('soutarah-analytics', {
    detail: {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...data
    }
  }));
  
  // Also log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, data);
  }
};

// Usage examples:
// emitAnalyticsEvent('carousel_next', { currentIndex: 2 });
// emitAnalyticsEvent('vehicle_reserve_click', { vehicleId: 'vehicle-001' });
// emitAnalyticsEvent('carousel_auto_scroll', { fromIndex: 0, toIndex: 1 });
```

## Responsive Layout Implementation

### Grid/Flexbox Structure

```jsx
<div className="carousel-track flex gap-6 transition-transform duration-300"
     style={{ 
       transform: `translateX(-${currentIndex * (100 / visibleCards)}%)` 
     }}>
  {vehicles.map((vehicle, index) => (
    <div 
      key={vehicle.id}
      className={`flex-shrink-0 ${
        visibleCards === 1 ? 'w-full' :
        visibleCards === 2 ? 'w-[calc(50%-12px)]' :
        'w-[calc(33.333%-16px)]'
      }`}
    >
      <VehicleCard vehicle={vehicle} onReserve={handleReserve} />
    </div>
  ))}
</div>
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Responsive Card Display

*For any* viewport width between 320px and 1920px, the carousel SHALL display the correct number of vehicle cards: 1 card for widths < 768px, 2 cards for widths 768-1023px, and 3 or more cards for widths ≥ 1024px.

**Validates: Requirements 1.1, 1.2, 1.3, 7.1**

### Property 2: Required Vehicle Information Display

*For any* vehicle object with valid data, the rendered Vehicle_Card SHALL display all required information fields: vehicle name, category badge, passenger capacity, daily rental price, and a "Réserver" button.

**Validates: Requirements 1.5**

### Property 3: Bidirectional Navigation

*For any* carousel position that is not at the boundary (not at first or last position), clicking the next Navigation_Button SHALL increment the position, and clicking the previous Navigation_Button SHALL decrement the position.

**Validates: Requirements 2.1, 2.2**

### Property 4: Bidirectional Swipe Gesture

*For any* carousel position that is not at the boundary, performing a left swipe Touch_Gesture with movement ≥ 50px SHALL scroll to the next vehicle, and performing a right swipe ≥ 50px SHALL scroll to the previous vehicle.

**Validates: Requirements 3.1, 3.2, 3.4**

### Property 5: Active Indicator Visual Distinction

*For any* carousel position, the Indicator_Dot corresponding to that position SHALL have visually distinct styling (active state) compared to all other indicator dots.

**Validates: Requirements 4.2**

### Property 6: Indicator Click Navigation

*For any* valid indicator index, clicking that Indicator_Dot SHALL scroll the carousel to display the vehicles at the corresponding position.

**Validates: Requirements 4.4**


### Property 7: Auto-Scroll Loop Behavior

*For any* carousel in auto-scroll mode, when reaching the last position, the carousel SHALL loop back to the first position (index 0).

**Validates: Requirements 5.4**

### Property 8: Reservation Modal Data Passing

*For any* vehicle selected for reservation, when the user clicks the "Réserver" button, the system SHALL open the Reservation_Modal with the correct vehicle ID, model name, and price pre-filled.

**Validates: Requirements 6.1, 6.5**

### Property 9: Navigation Button Visibility

*For any* viewport width, navigation buttons SHALL be visible (display: block) for desktop screens (≥ 1024px) and hidden (display: none) for mobile screens (< 768px).

**Validates: Requirements 7.4**

### Property 10: Image Lazy Loading

*For any* vehicle image that is not currently in the viewport (beyond 500px margin), the image SHALL not be loaded until it is about to enter the visible area.

**Validates: Requirements 8.1, 8.2**

### Property 11: Placeholder Display for Loading Images

*For any* vehicle card where the image has not yet loaded, the carousel SHALL display a skeleton loader or placeholder until the image loads successfully.

**Validates: Requirements 8.3**

### Property 12: Keyboard Navigation

*For any* carousel position with focus, pressing the right arrow key SHALL navigate to the next vehicle, and pressing the left arrow key SHALL navigate to the previous vehicle.

**Validates: Requirements 9.5**

### Property 13: ARIA Label Completeness on Indicators

*For any* indicator dot at position N in a carousel with total T vehicles, the indicator SHALL have an ARIA label in the format "Véhicule N sur T" (e.g., "Véhicule 3 sur 10").

**Validates: Requirements 9.6**


### Property 14: ARIA Live Region Updates

*For any* carousel position change, the system SHALL update the ARIA live region with an announcement describing the current visible range (e.g., "Affichage des véhicules 1 à 3 sur 10").

**Validates: Requirements 9.4**

### Property 15: Analytics Event Emission

*For any* user interaction with the carousel (navigation, swipe, reservation click), the system SHALL emit a corresponding custom analytics event with relevant context data.

**Validates: Requirements 10.6**

### Property 16: Image Error Handling

*For any* vehicle image that fails to load, the carousel SHALL display a placeholder image containing the vehicle category icon (car/van/bus icon) instead of a broken image.

**Validates: Requirements 11.2**

### Property 17: Console Error Logging

*For any* error that occurs during carousel operation (data loading failure, image failure), the system SHALL log descriptive error information to the browser console.

**Validates: Requirements 11.5**

### Property 18: Responsive Image Optimization

*For any* device pixel ratio (1x, 2x, 3x), the carousel SHALL request appropriately sized images that match the device's pixel density to optimize loading performance.

**Validates: Requirements 8.5**

### Property 19: Reduced Motion Respect

*For any* user with prefers-reduced-motion setting enabled, the carousel SHALL disable all scroll animations and transitions while maintaining full functionality.

**Validates: Requirements 12.5**

### Property 20: Layout Aspect Ratio Preservation

*For any* viewport size change within the supported range (320px-1920px), the Vehicle_Card SHALL maintain its aspect ratio while scaling proportionally.

**Validates: Requirements 7.2**


## Testing Strategy

The vehicle carousel will be tested using a dual testing approach:

### Unit Tests (Example-Based)

Focus on specific scenarios, edge cases, and integration points:

- **Component Rendering**: Verify carousel renders correctly with various vehicle counts
- **Edge Cases**: Test boundary conditions (empty state, single vehicle, disabled buttons at edges)
- **Error States**: Test data loading failures, image load errors, empty vehicle list
- **UI Elements**: Verify minimum sizes (button touch targets, indicator dots, image dimensions)
- **Accessibility Elements**: Verify ARIA labels, screen reader text, keyboard focus order
- **Integration**: Verify CarReservationModal integration, data structure compatibility
- **Animation Settings**: Verify CSS transitions, reduced motion handling

### Property-Based Tests

Verify universal properties across randomized inputs (minimum 100 iterations per property):

Each property test must reference its design document property using the tag format:
**Feature: vehicle-carousel, Property {number}: {property_text}**

- **Property 1**: Test with random viewport widths (320-1920px), verify correct card count
- **Property 2**: Generate random vehicle objects, verify all fields are rendered
- **Property 3**: Test navigation at random non-boundary positions
- **Property 4**: Test swipe gestures with random distances and positions
- **Property 5**: Test active indicator styling at random positions
- **Property 6**: Click random indicators, verify position changes
- **Property 7**: Test auto-scroll loop at last position
- **Property 8**: Test reservation with random vehicles, verify modal data
- **Property 9**: Test button visibility at random viewport widths
- **Property 10**: Mock intersection observer, test lazy loading with random vehicle lists
- **Property 11**: Test placeholder display with random loading states
- **Property 12**: Test keyboard navigation at random positions
- **Property 13**: Generate random carousel sizes, verify all indicator labels
- **Property 14**: Test ARIA live updates at random position changes
- **Property 15**: Test analytics events for random user interactions
- **Property 16**: Generate random vehicles with broken images, verify placeholders
- **Property 17**: Generate random error scenarios, verify console logging
- **Property 18**: Test with random device pixel ratios, verify image URLs
- **Property 19**: Test with random motion preferences, verify animation behavior
- **Property 20**: Test aspect ratio at random viewport sizes


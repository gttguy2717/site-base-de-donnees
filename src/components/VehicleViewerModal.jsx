import React, { useState, useEffect } from 'react';

const FUEL_TYPES = ['Essence', 'Gazole', 'Hybride', 'Diesel'];
const displaySpecs = (vehicle) => (vehicle.specs || []).filter((spec) => !FUEL_TYPES.includes(spec));

export default function VehicleViewerModal({ vehicle, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Empêcher le scroll du body quand le modal est ouvert
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handleReset = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!vehicle) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative h-full w-full max-w-7xl p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec infos véhicule */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-white/20 bg-black/60 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined text-xl">directions_car</span>
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold text-white">
                  {vehicle.name}
                </h2>
                <p className="text-xs font-semibold text-emerald-200">
                  {vehicle.category}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-white hover:text-gray-900"
            aria-label="Fermer l'aperçu"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Zone d'image interactive */}
        <div
          className="flex h-full items-center justify-center overflow-hidden rounded-3xl"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="max-h-[80vh] max-w-full object-contain transition-transform duration-300"
            style={{
              transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
            }}
            draggable={false}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/800x600/143e22/ffffff?text=Image+non+disponible';
            }}
          />
        </div>

        {/* Contrôles de zoom */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/20 bg-black/60 p-2 backdrop-blur-md">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom arrière"
          >
            <span className="material-symbols-outlined">zoom_out</span>
          </button>

          <span className="min-w-16 text-center text-sm font-bold text-white">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom avant"
          >
            <span className="material-symbols-outlined">zoom_in</span>
          </button>

          <div className="mx-2 h-8 w-px bg-white/20" />

          <button
            onClick={handleReset}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20"
            aria-label="Réinitialiser la vue"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>

        {/* Spécifications du véhicule */}
        <div className="absolute bottom-4 right-4 z-10 max-w-xs rounded-2xl border border-white/20 bg-black/60 p-4 backdrop-blur-md">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-200">
            Caractéristiques
          </p>
          <div className="grid grid-cols-2 gap-2">
            {displaySpecs(vehicle).map((spec, index) => (
              <div
                key={spec}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"
              >
                <span className="material-symbols-outlined text-sm text-primary">
                  {['group', 'local_gas_station', 'settings', 'verified_user'][index]}
                </span>
                <span className="text-xs font-semibold text-white">{spec}</span>
              </div>
            ))}
          </div>

          {vehicle.plate && (
            <div className="mt-3 rounded-xl bg-white/10 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Immatriculation
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-white">
                {vehicle.plate}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 z-10 rounded-2xl border border-white/20 bg-black/60 px-4 py-2 backdrop-blur-md">
          <p className="text-xs text-white/80">
            <span className="material-symbols-outlined text-sm align-middle">mouse</span>
            {' '}Molette pour zoomer • Glisser pour déplacer
          </p>
        </div>
      </div>
    </div>
  );
}

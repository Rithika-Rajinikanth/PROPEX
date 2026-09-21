// src/components/ai/PropertyCard.tsx - FIXED
'use client';

import Link from 'next/link';
import { MapPin, TrendingUp, DollarSign, Home } from 'lucide-react';

interface PropertyCardProps {
  property: any; // RegionMetrics shape from /api/v1/regions/{id}/metrics
}

export function PropertyCard({ property }: PropertyCardProps) {
  // ✅ FIX: Resolve id — metrics endpoint returns region_id, regions endpoint returns id
  const regionId = property.region_id ?? property.id;

  const { external_data } = property;
  const redfin = external_data?.redfin;

  const formatPrice = (value: number | null | undefined) => {
    if (!value) return null;
    return `$${Math.round(value / 1000).toLocaleString()}K`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {property.region_name}
            {property.state_name ? `, ${property.state_name}` : ''}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {property.region_type ?? 'Region'} • ID: {regionId}
          </p>
        </div>
        {property.heat_index != null && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            Heat: {Number(property.heat_index).toFixed(1)}
          </div>
        )}
      </div>

      {/* Price grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {property.current_value != null && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
              <Home className="w-3 h-3" /> Current Value
            </div>
            <div className="text-base font-bold text-blue-900">
              {formatPrice(property.current_value)}
            </div>
          </div>
        )}
        {property.median_list_price != null && (
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-purple-600 font-medium mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> List Price
            </div>
            <div className="text-base font-bold text-purple-900">
              {formatPrice(property.median_list_price)}
            </div>
          </div>
        )}
        {/* Redfin external price */}
        {redfin?.median_sale_price != null && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium mb-1">Redfin Sale Price</div>
            <div className="text-base font-bold text-green-900">
              {formatPrice(redfin.median_sale_price)}
            </div>
          </div>
        )}
        {property.inventory != null && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 font-medium mb-1">Inventory</div>
            <div className="text-base font-bold text-gray-800">
              {Number(property.inventory).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Redfin market stats */}
      {redfin && (
        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="bg-gray-100 rounded p-2">
            <div className="text-gray-500">Days on Market</div>
            <div className="font-semibold text-gray-800">{redfin.median_dom ?? 'N/A'} days</div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-gray-500">Inventory</div>
            <div className="font-semibold text-gray-800">
              {redfin.inventory?.toLocaleString() ?? 'N/A'}
            </div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="text-gray-500">Homes Sold</div>
            <div className="font-semibold text-gray-800">{redfin.homes_sold ?? 'N/A'}</div>
          </div>
        </div>
      )}

      {/* ✅ View Details link — uses resolved regionId */}
      {regionId ? (
        <Link
          href={`/regions/${regionId}`}
          className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          View Full Details →
        </Link>
      ) : (
        <div className="text-center text-xs text-gray-400 py-2">No details link available</div>
      )}
    </div>
  );
}
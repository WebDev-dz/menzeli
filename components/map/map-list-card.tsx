import { ListingResource } from '@/api';
import { API_URL } from '@/lib/api-config';
import { formatPrice } from '@/lib/utils';
import React from 'react'

type Props = {
  property: ListingResource;
  isSelected: boolean;
  isHovered: boolean;
  locale: string;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// ─── Compact sidebar card ─────────────────────────────────────────────────────
export default function MapListCard({
  property,
  isSelected,
  isHovered,
  locale,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  
  const img = property.image ? `${API_URL}${property.image}` : null;

  return (
    <div
      data-property-id={property.id}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 14px",
        borderBottom: "1px solid #f3f4f6",
        background: isSelected ? "#eff4ff" : isHovered ? "#f8faff" : "#fff",
        borderRight: `3px solid ${isSelected ? "#1a56db" : "transparent"}`,
        cursor: "pointer",
        transition: "background 0.12s",
        alignItems: "flex-start",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 76,
          height: 64,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        {img ? (
          <img
            src={img}
            alt={property.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "🏠"
        )}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            margin: "0 0 3px",
            fontSize: 13,
            fontWeight: 700,
            color: "#111",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}
        >
          {property.title}
        </p>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 5,
            fontSize: 11,
            color: "#6b7280",
          }}
        >
          {(property?.surface || 0) > 0 && <span>📐 {property.surface} م²</span>}
          {(property as any).bhk > 0 && (
            <span>🛏 {(property as any).bhk} غرف</span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{ fontSize: 14, fontWeight: 800, color: "#1a56db" }}
          >
            {formatPrice(property.price, locale as "en")}
          </span>
          {/* {property.verified && (
            <span
              style={{
                fontSize: 10,
                color: "#059669",
                background: "#d1fae5",
                padding: "2px 6px",
                borderRadius: 99,
                fontWeight: 600,
              }}
            >
              موثّق ✓
            </span>
          )} */}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { chassisBrands, findChassisBrand, type ChassisBrandSeed } from "../data/chassisBrands";
import { navigate } from "../utils/routing";

type BrandLogoSize = "small" | "medium" | "large" | "hero";
type BrandLogoVariant = "full" | "mark" | "wordmark" | "text";

function brandFromProps(brandSlug?: string, brandName?: string): ChassisBrandSeed {
  return findChassisBrand(brandSlug || brandName) ?? chassisBrands[chassisBrands.length - 1];
}

export function BrandLogo({
  brandSlug,
  brandName,
  size = "medium",
  variant = "full",
  className = ""
}: {
  brandSlug?: string;
  brandName?: string;
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  className?: string;
}) {
  const brand = brandFromProps(brandSlug, brandName);
  const [failed, setFailed] = useState(false);
  const source = variant === "mark" ? brand.logoMark : variant === "wordmark" && brand.logoWordmark ? brand.logoWordmark : brand.logoDark;
  const label = `${brand.name} logo`;

  if (variant === "text" || failed) {
    return (
      <span className={`brandLogo brandLogo-${size} brandLogoFallback ${className}`} style={{ "--brand-accent": brand.brandColorAccent } as CSSProperties} aria-label={label}>
        {brand.fallbackLogoText}
      </span>
    );
  }

  return (
    <span
      className={`brandLogo brandLogo-${size} ${variant === "mark" ? "brandLogoMark" : ""} ${variant === "wordmark" ? "brandLogoWordmark" : ""} ${className}`}
      style={{ "--brand-accent": brand.brandColorAccent } as CSSProperties}
    >
      <img src={source} alt={label} onError={() => setFailed(true)} />
    </span>
  );
}

export function BrandBadge({ brandSlug, brandName }: { brandSlug?: string; brandName?: string }) {
  const brand = brandFromProps(brandSlug, brandName);
  const hasWordmark = Boolean(brand.logoWordmark);

  return (
    <span className={`brandBadge ${hasWordmark ? "brandBadgeWordmark" : ""}`}>
      <BrandLogo brandSlug={brand.slug} size={hasWordmark ? "medium" : "small"} variant={hasWordmark ? "wordmark" : "mark"} />
      {hasWordmark ? null : brand.name}
    </span>
  );
}

export function BrandCard({
  brand,
  count = 0,
  active = false,
  onClick
}: {
  brand: ChassisBrandSeed;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`brandCard ${active ? "active" : ""}`} type="button" onClick={onClick ?? (() => navigate(`/brands/${brand.slug}`))}>
      <BrandLogo brandSlug={brand.slug} size="large" variant="wordmark" />
      {count > 0 ? <span>{count} public tune{count === 1 ? "" : "s"}</span> : null}
    </button>
  );
}

export function BrandHeader({
  brand,
  subtitle,
  action
}: {
  brand: ChassisBrandSeed;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="brandHeader">
      <BrandLogo brandSlug={brand.slug} size="hero" />
      <div>
        <p>Chassis brand</p>
        <h1>{brand.name}</h1>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {action}
    </header>
  );
}

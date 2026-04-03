interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return <img src="/assets/logo.svg" alt="FAYZ BARAKA" className={className} />;
}

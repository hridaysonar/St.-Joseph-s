import Image from "next/image";

export default function BrandLogo({ size = 44, priority = false }) {
  return <Image src="/img/website%20logo.jpeg" alt="Student Life logo" width={size} height={size} unoptimized priority={priority} className="shrink-0 rounded-2xl object-contain shadow-sm" />;
}

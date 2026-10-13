import { DottedMap } from "@/components/ui/dotted-map";
import { BANGLADESH_REGION, BANGLADESH_RINGS } from "@/lib/bangladesh-outline";

const DIVISION_CITIES = [
  { lat: 23.8103, lng: 90.4125, size: 1 },
  { lat: 22.3569, lng: 91.7832, size: 0.65 },
  { lat: 24.3745, lng: 88.6042, size: 0.6 },
  { lat: 24.8949, lng: 91.8687, size: 0.6 },
  { lat: 22.8456, lng: 89.5403, size: 0.6 },
  { lat: 24.7471, lng: 90.4203, size: 0.55 },
  { lat: 25.7439, lng: 89.2752, size: 0.6 },
  { lat: 22.701, lng: 90.3535, size: 0.6 },
];

export function BangladeshMap() {
  return (
    <div className="mx-auto w-full max-w-md">
      <DottedMap
        width={73}
        height={100}
        mapSamples={5200}
        region={BANGLADESH_REGION}
        outline={BANGLADESH_RINGS}
        markers={DIVISION_CITIES}
        dotColor="currentColor"
        markerColor="#10b981"
        dotRadius={0.3}
        pulse
        className="text-foreground/30"
        style={{ height: "auto" }}
      />
    </div>
  );
}

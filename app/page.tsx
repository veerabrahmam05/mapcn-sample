import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";

export default function MyMap() {
  return (
    <Card className="h-screen p-0 overflow-hidden">
      <Map center={[-74.006, 40.7128]} zoom={0}>
        <MapControls />
      </Map>
    </Card>
  );
}
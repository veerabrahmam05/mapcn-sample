import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import SupplierMap from "@/components/ui/supplier-map";

export default function MyMap() {
  return (
    <Card className="h-screen p-0 overflow-hidden">
      <SupplierMap />
    </Card>
  );
}

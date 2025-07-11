import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuggestStockNeedsForm } from "./suggest-stock-needs-form";
import { SuggestSuppliersForm } from "./suggest-suppliers-form";
import { CheckItemPriceForm } from "./check-item-price-form";

export default function AiAssistantPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Asistente de IA</h1>
        <p className="text-muted-foreground">
          Aproveche la IA para tomar decisiones de inventario y adquisiciones más inteligentes.
        </p>
      </div>

      <Tabs defaultValue="stock-needs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock-needs">Sugerir Necesidades de Stock</TabsTrigger>
          <TabsTrigger value="suggest-suppliers">Sugerir Proveedores</TabsTrigger>
          <TabsTrigger value="check-price">Verificar Precio de Artículo</TabsTrigger>
        </TabsList>
        <TabsContent value="stock-needs">
          <SuggestStockNeedsForm />
        </TabsContent>
        <TabsContent value="suggest-suppliers">
          <SuggestSuppliersForm />
        </TabsContent>
        <TabsContent value="check-price">
          <CheckItemPriceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuggestStockNeedsForm } from "./suggest-stock-needs-form";
import { SuggestSuppliersForm } from "./suggest-suppliers-form";
import { CheckItemPriceForm } from "./check-item-price-form";

export default function AiAssistantPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Assistant</h1>
        <p className="text-muted-foreground">
          Leverage AI for smarter inventory and procurement decisions.
        </p>
      </div>

      <Tabs defaultValue="stock-needs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock-needs">Suggest Stock Needs</TabsTrigger>
          <TabsTrigger value="suggest-suppliers">Suggest Suppliers</TabsTrigger>
          <TabsTrigger value="check-price">Check Item Price</TabsTrigger>
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

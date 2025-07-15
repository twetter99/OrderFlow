
"use client"

import * as React from "react"
import Image from "next/image";
import { Check, ChevronsUpDown, ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { InventoryItem } from "@/lib/types"

interface ItemComboboxProps {
  inventoryItems: InventoryItem[];
  value: string;
  onChange: (item: InventoryItem | { name: string, unitCost: number, unit: string, id: undefined, sku: undefined, type: 'Material' | 'Servicio' }) => void;
  disabled?: boolean;
}

export function ItemCombobox({ inventoryItems, value, onChange, disabled }: ItemComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || '')

  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const selectedItem = inventoryItems.find(item => item.name.toLowerCase() === currentValue.toLowerCase());
    if (selectedItem) {
      onChange(selectedItem);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {value ? value : "Selecciona o escribe un artículo..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{width: 'var(--radix-popover-trigger-width)'}}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar o crear artículo..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                <CommandItem onSelect={() => {
                    onChange({ name: inputValue, unitCost: 0, unit: 'ud', id: undefined, sku: undefined, type: 'Material' });
                    setOpen(false);
                }}>
                    Crear nuevo artículo: "{inputValue}"
                </CommandItem>
            </CommandEmpty>
            <CommandGroup>
              {inventoryItems.filter(item => item.name.toLowerCase().includes(inputValue.toLowerCase())).map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={handleSelect}
                  className="flex justify-between items-start gap-2"
                >
                    <div className="flex items-start gap-2">
                        <Check
                            className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0 mt-1",
                            value === item.name ? "opacity-100" : "opacity-0"
                            )}
                        />
                        <div className="flex-grow">
                            {item.name}
                            <div className="text-xs text-muted-foreground">
                                SKU: {item.sku} | Coste: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.unitCost)} / {item.unit}
                            </div>
                        </div>
                    </div>
                   <div className="flex-shrink-0">
                    {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={item.dataAiHint}/>
                    ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
                            <ImageOff className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                   </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

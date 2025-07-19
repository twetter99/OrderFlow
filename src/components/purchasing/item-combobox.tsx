
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
  const [open, setOpen] = React.useState(false);

  const handleSelect = (item: InventoryItem) => {
    onChange(item);
    setOpen(false);
  };
  
  const handleCreateNew = (inputValue: string) => {
     if (inputValue.trim()) {
        onChange({ name: inputValue, unitCost: 0, unit: 'ud', id: undefined, sku: undefined, type: 'Material' });
     }
     setOpen(false);
  }

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
        <Command>
          <CommandInput 
            placeholder="Buscar o crear artículo..." 
          />
          <CommandList>
            <CommandEmpty>
                <CommandItem
                    onSelect={(currentValue) => {
                        handleCreateNew(currentValue);
                    }}
                    value={
                        (document.querySelector('[cmdk-input]') as HTMLInputElement)?.value
                    }
                 >
                    Crear nuevo artículo: "{(document.querySelector('[cmdk-input]') as HTMLInputElement)?.value}"
                </CommandItem>
            </CommandEmpty>
            <CommandGroup>
              {inventoryItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => handleSelect(item)}
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
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

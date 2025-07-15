
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
import { Input } from "@/components/ui/input"

interface ItemComboboxProps {
  inventoryItems: InventoryItem[];
  value: string;
  onChange: (item: InventoryItem) => void;
  onTextChange: (text: string) => void;
  disabled?: boolean;
}

export function ItemCombobox({ inventoryItems, value, onChange, onTextChange, disabled }: ItemComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (currentValue: string) => {
    const selectedItem = inventoryItems.find(item => item.name.toLowerCase() === currentValue.toLowerCase());
    if (selectedItem) {
      onChange(selectedItem);
    }
    setOpen(false);
  };

  // Este es un componente no controlado para la entrada de texto manual.
  const ManualInput = () => {
    const [text, setText] = React.useState(value);

    return (
        <Input 
            value={text} 
            onChange={(e) => {
                const newText = e.target.value;
                setText(newText);
                onTextChange(newText);
            }} 
            placeholder="Escribe un artículo personalizado..."
            disabled={disabled}
        />
    )
  }

  const selectedItem = inventoryItems.find(item => item.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <div className="flex gap-2">
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[calc(100%-4rem)] justify-between"
                disabled={disabled}
                >
                <span className="truncate">
                    {value ? value : "Selecciona un artículo..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            {/* Si el artículo no está en la lista, mostramos un input manual */}
            {!selectedItem && <div className="w-full"><ManualInput/></div>}
        </div>
      <PopoverContent className="w-full p-0" style={{width: 'var(--radix-popover-trigger-width)'}}>
        <Command>
          <CommandInput placeholder="Buscar artículo..." />
          <CommandList>
            <CommandEmpty>No se encontró ningún artículo.</CommandEmpty>
            <CommandGroup>
              {inventoryItems.map((item) => (
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
                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md object-cover"/>
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

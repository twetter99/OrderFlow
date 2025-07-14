
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
  const [inputValue, setInputValue] = React.useState(value)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (currentValue: string) => {
    const selectedItem = inventoryItems.find(item => item.name.toLowerCase() === currentValue.toLowerCase());
    if (selectedItem) {
      onChange(selectedItem);
      setInputValue(selectedItem.name);
    }
    setOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    onTextChange(text);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Buscar o escribir un artículo..."
            className="w-full pr-8"
            disabled={disabled}
            onClick={() => setOpen(true)}
          />
          <ChevronsUpDown 
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50" 
            onClick={() => setOpen((o) => !o)}
          />
        </div>
      </PopoverTrigger>
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
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === item.name.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    {item.name}
                    <div className="text-xs text-muted-foreground">
                        SKU: {item.sku} | Coste: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(item.unitCost)}
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

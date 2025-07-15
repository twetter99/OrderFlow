

"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Supplier } from "@/lib/types"

interface SupplierComboboxProps {
  suppliers: Supplier[];
  value: string;
  onChange: (value: string) => void;
  onAddNew: () => void;
  disabled?: boolean;
}

export function SupplierCombobox({ suppliers, value, onChange, onAddNew, disabled }: SupplierComboboxProps) {
  const [open, setOpen] = React.useState(false)

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
          {value
            ? suppliers.find((supplier) => supplier.name.toLowerCase() === value.toLowerCase())?.name
            : "Selecciona un proveedor..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{width: 'var(--radix-popover-trigger-width)'}}>
        <Command>
          <CommandInput placeholder="Buscar proveedor..." />
          <CommandList>
            <CommandEmpty>No se encontró ningún proveedor.</CommandEmpty>
            <CommandGroup>
              {suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  value={supplier.name}
                  onSelect={(currentValue) => {
                    const supplierName = suppliers.find(s => s.name.toLowerCase() === currentValue.toLowerCase())?.name ?? ""
                    onChange(supplierName)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === supplier.name.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {supplier.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
                 <CommandItem
                    onSelect={() => {
                        onAddNew();
                        setOpen(false);
                    }}
                    className="cursor-pointer"
                 >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Añadir nuevo proveedor</span>
                </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

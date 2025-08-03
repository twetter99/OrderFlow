

"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, KeyRound, Clipboard, ClipboardCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange: (value: string) => void;
  isOptional?: boolean;
}

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, onValueChange, value, isOptional, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
      const newPassword = generatePassword();
      onValueChange(newPassword);
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(value as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <TooltipProvider>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            ref={ref}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={isOptional ? "Dejar en blanco para no cambiar" : "••••••"}
            className="pr-32"
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleGenerate}>
                        <KeyRound className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Generar contraseña</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} disabled={!value}>
                        {copied ? <ClipboardCheck className="h-4 w-4 text-green-500"/> : <Clipboard className="h-4 w-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Copiar</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                 <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{showPassword ? 'Ocultar' : 'Mostrar'} contraseña</p>
                </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

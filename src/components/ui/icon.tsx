
import React from "react";
import { LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Define the correct type for the icon name prop
interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof LucideIcons;
}

export function Icon({ name, ...props }: IconProps) {
  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[name] as React.FC<Omit<LucideProps, 'ref'>>;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return <LucideIcons.HelpCircle {...props} />;
  }
  
  return <IconComponent {...props} />;
}

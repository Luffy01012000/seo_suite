"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type SubmitButtonProps = ComponentProps<typeof Button> & {
  loadingText?: string;
};

export function SubmitButton({ 
  children, 
  loadingText, 
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button 
      {...props} 
      type="submit" 
      loading={pending}
    >
      {pending && loadingText ? loadingText : children}
    </Button>
  );
}

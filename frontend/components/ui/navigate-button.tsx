"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import type { ComponentProps } from "react";

type NavigateButtonProps = ComponentProps<typeof Button> & {
  href: string;
};

export function NavigateButton({ 
  href, 
  children, 
  ...props 
}: NavigateButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigate = () => {
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Button 
      {...props} 
      type="button" 
      loading={isPending} 
      onClick={handleNavigate}
    >
      {children}
    </Button>
  );
}

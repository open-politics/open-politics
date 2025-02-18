import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FixedCardProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  width?: string;
  height?: string;
  position?: "center" | "right";
}

export default function FixedCard({
  show,
  onClose,
  title,
  children,
  className,
  width = "w-[600px]",
  height = "h-[80vh]",
  position = "center",
}: FixedCardProps) {
  if (!show) return null;

  const positionClasses = {
    center: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    right: "fixed top-0 right-0 h-screen",
  };

  return (
    <Card 
      className={cn(
        "bg-background border shadow-lg z-50",
        width,
        height,
        positionClasses[position],
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
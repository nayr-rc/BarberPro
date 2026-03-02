"use client";

import { ButtonHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "gold" | "outline" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
};

export default function Button({
    variant = "gold",
    size = "md",
    loading = false,
    className = "",
    children,
    onClick,
    ...props
}: ButtonProps) {
    const [internalLoading, setInternalLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || internalLoading) return;

        if (onClick) {
            setInternalLoading(true);
            try {
                await onClick(e);
            } finally {
                setInternalLoading(false);
            }
        }
    };

    const base = "font-semibold rounded-2xl flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barber-gold active:scale-[0.96] transition-all min-h-[52px]";

    const sizes = {
        sm: "h-10 px-5 text-sm",
        md: "h-12 px-7 text-base",
        lg: "h-14 px-8 text-lg w-full",
    };

    const variants = {
        gold: "bg-gradient-to-r from-barber-gold to-amber-500 text-black hover:brightness-110",
        outline: "border-2 border-white/10 hover:bg-white/5 bg-white/5",
        ghost: "hover:bg-white/10",
        destructive: "bg-red-600 hover:bg-red-700",
    };

    const currentLoading = loading || internalLoading;

    return (
        <button
            className={cn(base, sizes[size], variants[variant], className)}
            onClick={handleClick}
            disabled={currentLoading}
            aria-busy={currentLoading}
            {...props}
        >
            {currentLoading && <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
            {children}
        </button>
    );
}

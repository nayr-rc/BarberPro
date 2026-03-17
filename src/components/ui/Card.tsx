import { HTMLAttributes } from "react";

export default function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`glass rounded-3xl p-6 card-hover ${className}`} {...props}>
            {children}
        </div>
    );
}

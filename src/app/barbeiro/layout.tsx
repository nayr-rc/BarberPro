import SubscriptionGuard from "@/components/SubscriptionGuard";

export default function BarbeiroLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SubscriptionGuard>{children}</SubscriptionGuard>;
}

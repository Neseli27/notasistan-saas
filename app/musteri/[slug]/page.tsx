import { CustomerPortal } from "@/components/customer/CustomerPortal";

interface RouteProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default async function CustomerPortalRoute({ params }: RouteProps) {
  const resolvedParams = await params;
  return <CustomerPortal slug={resolvedParams.slug} />;
}

import { PublicBookingPage } from "@/components/public/PublicBookingPage";

interface RouteProps {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default async function PublicBookingRoute({ params }: RouteProps) {
  const resolvedParams = await params;
  return <PublicBookingPage slug={resolvedParams.slug} />;
}

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import VisitButton from "@/components/VisitButton";

export default async function SiteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: site } = await supabase
    .from("heritage_sites")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!site) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-4">Site not found</h1>
        <Link href="/" className="text-green-700 underline">
          Back to map
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link href="/" className="text-green-700 hover:underline">
        Back to map
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
        <h1 className="text-3xl font-bold text-green-800 mb-2">{site.name}</h1>
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-4">{site.category}</p>

        <p className="text-gray-700 mb-4">{site.long_description || site.short_description || "No description available."}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-gray-700">
          <div>
            <strong>Operating Hours:</strong> {site.operating_hours || "Not specified"}
          </div>
          <div>
            <strong>Entrance Fee:</strong> {site.entrance_fee || "Not specified"}
          </div>
          <div>
            <strong>Latitude:</strong> {site.latitude}
          </div>
          <div>
            <strong>Longitude:</strong> {site.longitude}
          </div>
        </div>

        <VisitButton siteId={site.id} />
      </div>
    </div>
  );
}

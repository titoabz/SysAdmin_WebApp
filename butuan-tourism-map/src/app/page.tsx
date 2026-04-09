import MapWrapper from "@/components/MapWrapper";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-green-800 to-green-700 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Butuan Tourism Map</h1>
          <p className="text-sm text-green-100">
            Discover the rich history of Butuan City, the Home of the Balangays
          </p>
        </div>
      </section>

      <section className="py-4">
        <div className="container mx-auto px-2">
          <MapWrapper />
        </div>
      </section>

      <div className="text-center text-xs text-gray-400 py-4">
        <Link href="/admin/login" className="hover:text-gray-600">
          Admin Access
        </Link>
      </div>
    </main>
  );
}

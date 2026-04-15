import MapWrapper from "@/components/MapWrapper";
import AdminLink from "@/components/AdminLink";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section - Better visual hierarchy */}
      <section className="bg-gradient-to-br from-green-800 to-green-900 text-white py-10 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-4">
            <span className="text-5xl md:text-6xl">🏛️</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
            Butuan Tourism Map
          </h1>
          <p className="text-sm md:text-base text-green-100 max-w-2xl mx-auto leading-relaxed">
            Discover the rich history and cultural heritage of Butuan City,<br />
            the <span className="font-semibold">"Home of the Balangays"</span>
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-3 md:py-4">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800">Explore Heritage Sites</h2>
            <span className="text-xs text-gray-400">Tap markers for details</span>
          </div>
          <MapWrapper />
        </div>
      </section>

      {/* Admin Link - Only visible to admins */}
      <div className="text-center text-xs text-gray-400 py-4 md:py-6">
        <AdminLink />
      </div>
    </main>
  );
}

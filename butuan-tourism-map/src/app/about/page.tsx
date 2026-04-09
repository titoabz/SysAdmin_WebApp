export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-green-800 mb-6">About Butuan Tourism Map</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700">
          To preserve, promote, and celebrate the rich cultural heritage of Butuan City, the Home of the
          Balangays.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">About Butuan City</h2>
        <p className="text-gray-700 mb-4">
          Butuan City is one of the oldest settlements in the Philippines, dating back to the fourth century.
          It was a major trading hub in Southeast Asia, evidenced by the discovery of the Balangay boats.
        </p>
        <p className="text-gray-700">
          Today, Butuan continues to be a center of commerce, culture, and history in the Caraga region.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="text-gray-700">
          <strong>Email:</strong> tourism@butuan.gov.ph
        </p>
        <p className="text-gray-700">
          <strong>Facebook:</strong> @ButuanTourism
        </p>
      </div>
    </div>
  );
}

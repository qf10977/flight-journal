export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="text-center">
      <div className="bg-indigo-100 rounded-lg p-6 mb-4">
        <svg className="h-12 w-12 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500">{description}</p>
    </div>
  );
}
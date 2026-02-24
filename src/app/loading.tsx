import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Nelax...</h2>
        <p className="text-gray-500 text-sm">Please wait while we set things up for you.</p>
      </div>
    </div>
  );
}

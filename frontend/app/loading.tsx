export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      {/* Spinning circle */}
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )
}

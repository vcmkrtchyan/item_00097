import { Suspense } from "react"
import { MainLayout } from "@/components/layouts/main-layout"
import { ItineraryManager } from "@/components/itinerary/itinerary-manager"
import { Skeleton } from "@/components/ui/skeleton"

export default function ItineraryPage() {
  return (
    <MainLayout>
      <Suspense fallback={<ItineraryFallback />}>
        <ItineraryManager />
      </Suspense>
    </MainLayout>
  )
}

function ItineraryFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}


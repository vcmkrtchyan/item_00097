import { MainLayout } from "@/components/layouts/main-layout"
import { BookmarkManager } from "@/components/bookmarks/bookmark-manager"

export default function BookmarksPage() {
  return (
    <MainLayout>
      <BookmarkManager />
    </MainLayout>
  )
}


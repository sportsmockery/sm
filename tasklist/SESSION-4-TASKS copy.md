# SESSION 4 - ADMIN CMS, AUTH & BACKEND
## SportsMockery.com Migration

**INSTRUCTIONS:** Complete each section in order. Mark tasks [x] as you complete them. When a section is done, immediately start the next section. Run the notification command after each section.

When you complete a section, run:
```
osascript -e 'display notification "Section complete!" with title "Session 4"' && afplay /System/Library/Sounds/Glass.aiff
```

---

## SECTION 1: Authentication Setup (15 tasks) ✅ COMPLETE
- [x] 1. npm install @supabase/auth-helpers-nextjs @supabase/ssr
- [x] 2. Create src/lib/auth.ts:
  - signIn(email, password) function
  - signUp(email, password) function
  - signOut() function
  - resetPassword(email) function
  - getCurrentUser() function
- [x] 3. Create src/contexts/AuthContext.tsx:
  - Auth state provider
  - User object
  - Loading state
  - isAuthenticated boolean
- [x] 4. Create src/hooks/useAuth.ts:
  - Hook to access auth context
  - user, loading, signIn, signOut, etc.
- [x] 5. Create src/app/login/page.tsx:
  - Login form
  - Email and password inputs
  - "Remember me" checkbox
  - "Forgot password" link
  - "Sign up" link
  - Error display
  - Redirect to /admin on success
- [x] 6. Create src/app/signup/page.tsx:
  - Sign up form
  - Email, password, confirm password
  - Terms checkbox
  - "Already have account?" link
- [x] 7. Create src/app/forgot-password/page.tsx:
  - Email input
  - Send reset link button
  - Success message
- [x] 8. Create src/app/reset-password/page.tsx:
  - New password input
  - Confirm password
  - Submit button
- [x] 9. Create src/app/api/auth/callback/route.ts:
  - Handle Supabase auth callback
  - Exchange code for session
- [x] 10. Create src/components/auth/LoginForm.tsx:
  - Styled form component
  - Loading state on submit
  - Error handling
- [x] 11. Create src/components/auth/SignupForm.tsx:
  - Styled signup form
  - Password strength indicator
- [x] 12. Create src/components/auth/ForgotPasswordForm.tsx:
  - Email input form
- [x] 13. Create src/middleware.ts:
  - Protect /admin/* routes
  - Redirect to /login if not authenticated
  - Allow public routes
- [x] 14. Update src/app/layout.tsx - Wrap with AuthContext provider
- [x] 15. Create src/components/auth/ProtectedRoute.tsx:
  - Wrapper component for protected pages
  - Shows loading while checking auth
  - Redirects if not authenticated

**Run notification command, then continue to Section 2**

---

## SECTION 2: Admin Layout & Dashboard (15 tasks) ✅ COMPLETE
- [x] 1. Create src/app/admin/layout.tsx:
  - Dark sidebar layout
  - Main content area
  - Top bar with user menu
  - Mobile responsive
- [x] 2. Create src/components/admin/AdminSidebar.tsx:
  - Dark background (#1a1a1a)
  - Logo at top
  - Navigation links with icons:
    - Dashboard (home icon)
    - Posts (document icon)
    - Categories (folder icon)
    - Authors (users icon)
    - Media (image icon)
    - Settings (gear icon)
  - Active state highlight
  - Collapsible on mobile
- [x] 3. Create src/components/admin/AdminTopBar.tsx:
  - Breadcrumb
  - Search input
  - Notifications bell
  - User avatar dropdown
  - "View Site" link
- [x] 4. Create src/components/admin/AdminCard.tsx:
  - Reusable card for dashboard
  - Title, value, icon, change indicator
- [x] 5. Create src/app/admin/page.tsx - Dashboard:
  - Welcome message with user name
  - Stats cards row:
    - Total Posts (count from sm_posts)
    - Total Views (sum of views)
    - Total Authors (count from sm_authors)
    - Total Categories (count from sm_categories)
  - Recent posts list
  - Quick actions buttons
- [x] 6. Create src/components/admin/StatsCard.tsx:
  - Large number
  - Label
  - Icon
  - Trend indicator (+5% this week)
  - Color variants
- [x] 7. Create src/components/admin/RecentPosts.tsx:
  - Table of 10 most recent posts
  - Title, category, date, status, actions
- [x] 8. Create src/components/admin/QuickActions.tsx:
  - "New Post" button
  - "New Category" button
  - "Upload Media" button
- [x] 9. Create src/components/admin/ActivityFeed.tsx:
  - Recent activity list
  - "John published 'Article Title'"
  - Timestamps
- [x] 10. Create src/components/admin/DashboardChart.tsx:
  - Views over time line chart
  - Last 30 days
  - Using recharts
- [x] 11. Create src/components/admin/TopPosts.tsx:
  - Top 5 posts by views
  - Bar chart
- [x] 12. Create src/components/admin/CategoryBreakdown.tsx:
  - Posts by category pie chart
- [x] 13. Create src/lib/adminStats.ts:
  - Functions to fetch dashboard stats
  - getPostCount()
  - getTotalViews()
  - getAuthorCount()
  - getRecentPosts()
- [x] 14. Create src/app/admin/loading.tsx - Admin loading state
- [x] 15. Create src/components/admin/MobileAdminNav.tsx:
  - Bottom navigation for mobile
  - Key admin actions

**Run notification command, then continue to Section 3**

---

## SECTION 3: Posts Management (20 tasks) ✅ COMPLETE
- [x] 1. Create src/app/admin/posts/page.tsx - Posts list:
  - Table with all posts
  - Search input
  - Filter by category dropdown
  - Filter by status (published, draft)
  - Sort by date, title, views
  - Pagination
- [x] 2. Create src/components/admin/PostsTable.tsx:
  - Columns: Checkbox, Title, Category, Author, Date, Status, Views, Actions
  - Sortable headers
  - Row hover effect
  - Bulk select
- [x] 3. Create src/components/admin/PostsFilters.tsx:
  - Search input
  - Category filter dropdown
  - Status filter dropdown
  - Date range picker
  - Clear filters button
- [x] 4. Create src/components/admin/PostRow.tsx:
  - Single post row
  - Title link to edit
  - Category badge
  - Status badge (green=published, yellow=draft)
  - Quick actions: Edit, View, Delete
- [x] 5. Create src/components/admin/BulkActions.tsx:
  - Actions for selected posts
  - Delete selected
  - Change status
  - Change category
- [x] 6. Create src/app/admin/posts/new/page.tsx - New post page
- [x] 7. Create src/app/admin/posts/[id]/edit/page.tsx - Edit post page
- [x] 8. npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
- [x] 9. Create src/components/admin/PostEditor.tsx:
  - TipTap rich text editor
  - Toolbar: Bold, Italic, Underline, Link, Image, Headings, Lists, Quote, Code
  - Full height editor
  - Autosave indicator
- [x] 10. Create src/components/admin/PostEditorToolbar.tsx:
  - Editor toolbar buttons
  - Icon buttons with tooltips
  - Active state for formatting
- [x] 11. Create src/components/admin/PostForm.tsx:
  - Title input
  - Slug input (auto-generated from title)
  - Editor component
  - Excerpt textarea
  - Featured image selector
- [x] 12. Create src/components/admin/PostSidebar.tsx:
  - Right sidebar in editor
  - Publish panel
  - Category selector
  - Author selector
  - SEO fields
- [x] 13. Create src/components/admin/PublishPanel.tsx:
  - Status dropdown (draft, published)
  - Publish date picker
  - Visibility (public, private)
  - Publish/Update button
  - Save Draft button
- [x] 14. Create src/components/admin/CategorySelector.tsx:
  - Dropdown to select category
  - Show category hierarchy
  - Add new category inline
- [x] 15. Create src/components/admin/FeaturedImagePicker.tsx:
  - Current image preview
  - Upload new button
  - Remove button
  - Opens media modal
- [x] 16. Create src/components/admin/SEOFields.tsx:
  - SEO Title input
  - Meta description textarea
  - Character counters
  - Preview snippet
  - OG Image selector
- [x] 17. Create src/app/api/admin/posts/route.ts:
  - GET: List posts with pagination, filters
  - POST: Create new post
- [x] 18. Create src/app/api/admin/posts/[id]/route.ts:
  - GET: Single post
  - PUT: Update post
  - DELETE: Delete post
- [x] 19. Create src/lib/posts.ts:
  - getPosts(filters)
  - getPost(id)
  - createPost(data)
  - updatePost(id, data)
  - deletePost(id)
- [x] 20. Create src/components/admin/DeleteConfirmModal.tsx:
  - Confirmation modal
  - "Are you sure?" message
  - Cancel and Delete buttons

**Run notification command, then continue to Section 4**

---

## SECTION 4: Categories & Authors Management (15 tasks) ✅ COMPLETE
- [x] 1. Create src/app/admin/categories/page.tsx:
  - Categories list table
  - Name, Slug, Post Count, Actions
  - Add new button
- [x] 2. Create src/components/admin/CategoriesTable.tsx:
  - Sortable table
  - Edit inline or modal
  - Delete with confirmation
- [x] 3. Create src/app/admin/categories/new/page.tsx:
  - New category form
- [x] 4. Create src/components/admin/CategoryForm.tsx:
  - Name input
  - Slug input (auto-generate)
  - Description textarea
  - Parent category dropdown
  - Save button
- [x] 5. Create src/app/api/admin/categories/route.ts:
  - GET: List categories
  - POST: Create category
- [x] 6. Create src/app/api/admin/categories/[id]/route.ts:
  - GET: Single category
  - PUT: Update category
  - DELETE: Delete category
- [x] 7. Create src/app/admin/authors/page.tsx:
  - Authors list table
  - Name, Email, Role, Post Count, Actions
- [x] 8. Create src/components/admin/AuthorsTable.tsx:
  - Authors table
  - Avatar, name, email columns
  - Role badge
  - Actions: Edit, Delete
- [x] 9. Create src/app/admin/authors/[id]/page.tsx:
  - Author detail/edit page
- [x] 10. Create src/components/admin/AuthorForm.tsx:
  - Name input
  - Email input
  - Bio textarea
  - Avatar uploader
  - Role selector (admin, editor, author)
- [x] 11. Create src/app/api/admin/authors/route.ts:
  - GET: List authors
  - POST: Create author
- [x] 12. Create src/app/api/admin/authors/[id]/route.ts:
  - GET, PUT, DELETE for author
- [x] 13. Create src/lib/categories.ts:
  - CRUD functions for categories
- [x] 14. Create src/lib/authors.ts:
  - CRUD functions for authors
- [x] 15. Create src/components/admin/RoleSelector.tsx:
  - Role dropdown
  - Admin, Editor, Author options
  - Permission descriptions

**Run notification command, then continue to Section 5**

---

## SECTION 5: Media Library (15 tasks) ✅ COMPLETE
- [x] 1. Create src/app/admin/media/page.tsx:
  - Media library grid
  - Upload area
  - Search and filter
- [x] 2. Create src/components/admin/MediaGrid.tsx:
  - Grid of media items
  - Thumbnail, filename, size, date
  - Click to select
  - Multi-select mode
- [x] 3. Create src/components/admin/MediaUploader.tsx:
  - Drag and drop zone
  - Click to browse
  - Upload progress bar
  - Multiple file support
- [x] 4. Create src/components/admin/MediaItem.tsx:
  - Single media item card
  - Thumbnail
  - Hover overlay with actions
  - Selected state
- [x] 5. Create src/components/admin/MediaDetail.tsx:
  - Side panel or modal
  - Full preview
  - Filename, size, dimensions, date
  - Alt text input
  - Copy URL button
  - Delete button
- [x] 6. Create src/components/admin/MediaModal.tsx:
  - Modal for selecting media
  - Used in post editor
  - Grid view
  - Upload tab
  - Insert button
- [x] 7. Create src/lib/storage.ts:
  - uploadFile(file) - Upload to Supabase Storage
  - deleteFile(path)
  - getFileUrl(path)
  - listFiles()
- [x] 8. Create src/app/api/admin/media/route.ts:
  - GET: List media
  - POST: Upload media
- [x] 9. Create src/app/api/admin/media/[id]/route.ts:
  - GET: Single media
  - PUT: Update alt text
  - DELETE: Delete media
- [x] 10. Create Supabase storage bucket "media" if not exists
- [x] 11. Create src/components/admin/ImageOptimizer.tsx:
  - Auto-resize large images
  - Quality compression
  - Preview before upload
- [x] 12. Create src/components/admin/MediaFilters.tsx:
  - Filter by type (image, video, document)
  - Filter by date
  - Search by filename
- [x] 13. Create src/hooks/useMediaLibrary.ts:
  - Hook for media operations
  - upload, delete, list
  - Loading and error states
- [x] 14. Create src/components/admin/UploadProgress.tsx:
  - Progress bar component
  - File name and percentage
  - Cancel button
- [x] 15. Create src/utils/imageUtils.ts:
  - resizeImage(file, maxWidth)
  - getImageDimensions(file)
  - validateFileType(file)

**Run notification command, then continue to Section 6**

---

## SECTION 6: Settings & User Management (10 tasks) ✅ COMPLETE
- [x] 1. Create src/app/admin/settings/page.tsx:
  - Site settings form
  - General, SEO, Social, Email tabs
- [x] 2. Create src/components/admin/SettingsTabs.tsx:
  - Tab navigation
  - General, SEO, Social, Advanced
- [x] 3. Create src/components/admin/GeneralSettings.tsx:
  - Site name
  - Site description
  - Logo upload
  - Favicon upload
- [x] 4. Create src/components/admin/SEOSettings.tsx:
  - Default meta title template
  - Default meta description
  - Google Analytics ID
  - Sitemap settings
- [x] 5. Create src/components/admin/SocialSettings.tsx:
  - Twitter handle
  - Facebook page
  - Instagram handle
  - Default share image
- [x] 6. Create src/app/admin/users/page.tsx:
  - User management (for admins only)
  - List all users
  - Invite new user
- [x] 7. Create src/components/admin/UsersTable.tsx:
  - Users list
  - Name, email, role, last login
  - Actions: Edit role, Delete
- [x] 8. Create src/components/admin/InviteUser.tsx:
  - Invite form
  - Email input
  - Role selector
  - Send invite button
- [x] 9. Create src/app/api/admin/settings/route.ts:
  - GET: Get settings
  - PUT: Update settings
- [x] 10. Create src/lib/settings.ts:
  - getSettings()
  - updateSettings(data)
  - Settings stored in Supabase

**Run notification command - SESSION 4 COMPLETE**

---

## COMPLETION CHECKLIST
When all sections are done:
- [x] All 90 tasks completed
- [x] Run: `osascript -e 'display notification "SESSION 4 FULLY COMPLETE!" with title "Claude Code"' && afplay /System/Library/Sounds/Funk.aiff`
- [x] Report completion status

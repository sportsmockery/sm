# SESSION 2 - ARTICLE & CONTENT PAGES
## SportsMockery.com Migration

**INSTRUCTIONS:** Complete each section in order. Mark tasks [x] as you complete them. When a section is done, immediately start the next section. Run the notification command after each section.

When you complete a section, run:
```
osascript -e 'display notification "Section complete!" with title "Session 2"' && afplay /System/Library/Sounds/Glass.aiff
```

---

## SECTION 1: Article Card Components (15 tasks) ✅ COMPLETE
- [x] 1. Create src/components/article/ArticleCard.tsx:
  - Featured image with lazy loading
  - Category badge with team color
  - Title (bold, 2 lines max)
  - Excerpt (3 lines max)
  - Author avatar, name, date
  - Reading time estimate
  - Hover: scale up slightly, shadow increase, glow effect
- [x] 2. Create src/components/article/ArticleCardLarge.tsx:
  - Horizontal layout for featured
  - Image left, content right
  - Larger title, full excerpt
- [x] 3. Create src/components/article/ArticleCardCompact.tsx:
  - Small thumbnail left
  - Title and date right
  - For sidebar lists
- [x] 4. Create src/components/article/ArticleCardVideo.tsx:
  - Play button overlay on image
  - Duration badge bottom right
  - Video icon indicator
- [x] 5. Create src/components/article/ArticleList.tsx:
  - Vertical list of ArticleCardCompact
  - Numbered option for rankings
- [x] 6. Create src/components/article/ArticleGrid.tsx:
  - Responsive grid wrapper
  - 1 col mobile, 2 col tablet, 3 col desktop
  - Gap and padding standardized
- [x] 7. Create src/components/article/CategoryBadge.tsx:
  - Team-colored badge
  - Props: category slug, size variant
  - Maps slug to team colors automatically
- [x] 8. Create src/components/article/AuthorByline.tsx:
  - Avatar, name, date inline
  - Link to author page
  - Optional "and X others" for multiple authors
- [x] 9. Create src/components/article/ReadingTime.tsx:
  - Clock icon + "X min read"
  - Calculates from content length
- [x] 10. Create src/components/article/ShareButtons.tsx:
  - Twitter, Facebook, LinkedIn, Copy Link
  - Horizontal row or vertical floating
  - Animated icons on hover
  - Copy shows "Copied!" toast
- [x] 11. Create src/components/article/BookmarkButton.tsx:
  - Bookmark icon toggle
  - Saves to localStorage
  - Filled when bookmarked
- [x] 12. Create src/components/article/ReactionButtons.tsx:
  - 🔥 Fire, 😂 Laugh, 😢 Sad, 😡 Angry
  - Click to react
  - Show count next to each
  - Example counts: { fire: 234, laugh: 89, sad: 12, angry: 45 }
- [x] 13. Create src/components/article/ViewCount.tsx:
  - Eye icon + view count
  - Animated counter on load
- [x] 14. Create src/components/article/ArticleMeta.tsx:
  - Combines date, reading time, views
  - Separator dots between
- [x] 15. Create src/lib/readingTime.ts:
  - Function to calculate reading time from HTML content
  - ~200 words per minute

**Run notification command, then continue to Section 2**

---

## SECTION 2: Article Page Layout (20 tasks) ✅ COMPLETE
- [x] 1. Update src/app/[category]/[slug]/page.tsx with premium layout structure
- [x] 2. Create src/components/article/ArticleHero.tsx:
  - Full-width featured image
  - Gradient overlay bottom
  - Category badge top left
  - Title overlaid large white text
  - Author, date, reading time below title
- [x] 3. Create src/components/article/ArticleContent.tsx:
  - Max-width prose container (750px)
  - Styled typography:
    - h2: 28px bold, margin top 40px
    - h3: 22px semibold, margin top 32px
    - p: 18px, line-height 1.8, margin bottom 24px
    - blockquote: red left border, italic, gray background
    - links: red color, underline on hover
    - lists: proper bullets/numbers, indented
    - images: full width, rounded, caption below
- [x] 4. Create src/components/article/ArticleSidebar.tsx:
  - Sticky sidebar
  - Author card
  - Table of contents
  - Related articles
  - Ad placeholder
- [x] 5. Create src/components/article/TableOfContents.tsx:
  - Auto-generates from h2/h3 headings
  - Sticky on scroll
  - Highlights current section
  - Click to scroll to section
- [x] 6. Create src/components/article/AuthorCard.tsx:
  - Avatar (large)
  - Name, title/role
  - Bio text
  - Social links (Twitter, email)
  - "View all posts" link
  - Glass morphism card
- [x] 7. Create src/components/article/RelatedArticles.tsx:
  - "More from [Category]" header
  - 4 articles grid
  - Same category, exclude current
  - Uses ArticleCard component
- [x] 8. Create src/components/article/NextPrevArticle.tsx:
  - Full-width bottom section
  - Previous article left, Next right
  - Thumbnail, category, title
  - Arrow indicators
- [x] 9. Create src/components/article/ArticleTags.tsx:
  - Tag pills row
  - Red outline style
  - Click to filter (placeholder)
- [x] 10. Create src/components/article/ReadingProgressBar.tsx:
  - Fixed top bar (below header)
  - Red gradient fill
  - 0% to 100% as user scrolls
  - Smooth animation
- [x] 11. Create src/components/article/MockeryCommentary.tsx:
  - Witty AI commentary box
  - Red accent left border
  - "🔥 SM Take:" prefix
  - Italic sarcastic text
  - Example: "Williams is having a rookie season that makes Trubisky look like a practice squad hopeful. The kid is HIM."
- [x] 12. Create src/components/article/ArticleSchema.tsx:
  - JSON-LD structured data for SEO
  - Article schema with headline, author, date, image
- [x] 13. Create src/components/article/CommentSection.tsx:
  - "Comments" header with count
  - Disqus embed placeholder
  - Or custom comment list UI
- [x] 14. Create src/components/article/ArticleActions.tsx:
  - Floating bar on mobile (bottom)
  - Share, bookmark, reactions
  - Fixed position
- [x] 15. Create src/components/article/UpdatedDate.tsx:
  - "Updated: [date]" display
  - Shows if article was modified after publish
- [x] 16. Create src/components/article/FactBox.tsx:
  - Highlighted info box
  - Blue background
  - Key facts bullet list
  - Used for stats/quick facts
- [x] 17. Create src/components/article/PullQuote.tsx:
  - Large quote display
  - Big quotation marks
  - Attribution line
- [x] 18. Create src/components/article/ImageGallery.tsx:
  - Multiple images display
  - Click to expand lightbox
  - Swipe through
- [x] 19. Create src/components/article/EmbedVideo.tsx:
  - YouTube/Twitter embed wrapper
  - Responsive sizing
  - Loading placeholder
- [x] 20. Add generateMetadata to article page:
  - Title from post
  - Description from excerpt
  - OG image from featured image
  - Twitter card meta

**Run notification command, then continue to Section 3**

---

## SECTION 3: Category Pages (15 tasks) ✅ COMPLETE
- [x] 1. Update src/app/[category]/page.tsx with premium layout
- [x] 2. Create src/components/category/CategoryHeader.tsx:
  - Full-width banner
  - Team color gradient background
  - Category name large
  - Post count
  - Description if available
  - Parallax effect on scroll
- [x] 3. Create src/components/category/CategoryFilters.tsx:
  - Filter bar below header
  - Sort by: Latest, Popular, Oldest
  - Time filter: All time, This week, This month
- [x] 4. Create src/components/category/CategoryFeatured.tsx:
  - Top 3 featured posts for category
  - Large hero + 2 smaller
- [x] 5. Create src/components/category/CategoryGrid.tsx:
  - Main article grid
  - Infinite scroll or pagination
  - 12 articles per page
- [x] 6. Create src/components/category/CategorySidebar.tsx:
  - Trending in category
  - Popular authors
  - Related categories
- [x] 7. Create src/components/category/Pagination.tsx:
  - Page numbers
  - Previous/Next buttons
  - "Page X of Y" text
  - Jump to page input
- [x] 8. Create src/components/category/InfiniteScroll.tsx:
  - Load more on scroll
  - Loading spinner at bottom
  - "Load More" button fallback
- [x] 9. Create src/components/category/NoResults.tsx:
  - Empty state for no articles
  - Illustration placeholder
  - "Check back soon" message
- [x] 10. Create src/app/[category]/loading.tsx - Category loading skeleton
- [x] 11. Create src/app/[category]/error.tsx - Category error state
- [x] 12. Add generateMetadata to category page
- [x] 13. Create category pages for each team:
  - Verify /chicago-bears works
  - Verify /chicago-bulls works
  - Verify /chicago-cubs works
  - Verify /chicago-white-sox works
  - Verify /chicago-blackhawks works
- [x] 14. Create src/components/category/SubcategoryNav.tsx:
  - Sub-navigation for category sections
  - News, Rumors, Analysis, Opinion tabs
- [x] 15. Create src/components/category/CategoryStats.tsx:
  - Quick stats bar
  - Total articles, This week, Top author

**Run notification command, then continue to Section 4**

---

## SECTION 4: Author Pages (15 tasks) ✅ COMPLETE
- [x] 1. Update src/app/author/[id]/page.tsx with premium layout
- [x] 2. Create src/components/author/AuthorHeader.tsx:
  - Large avatar
  - Name, title
  - Bio paragraph
  - Social links row
  - Total articles, total views stats
  - Join date
- [x] 3. Create src/components/author/AuthorStats.tsx:
  - Stats cards row
  - Total posts, Total views, Categories covered
  - Animated counters
- [x] 4. Create src/components/author/AuthorArticles.tsx:
  - Grid of author's articles
  - Paginated or infinite scroll
  - Filter by category
- [x] 5. Create src/components/author/AuthorLatest.tsx:
  - 3 most recent articles
  - Featured style
- [x] 6. Create src/components/author/AuthorPopular.tsx:
  - Top 5 by views
  - Compact list style
- [x] 7. Create src/components/author/AuthorCategories.tsx:
  - Pie chart or bar of category breakdown
  - Shows where author writes most
- [x] 8. Create src/components/author/FollowButton.tsx:
  - Follow/Following toggle button
  - Saves to localStorage for now
- [x] 9. Create src/app/author/[id]/loading.tsx - Author loading skeleton
- [x] 10. Add generateMetadata to author page
- [x] 11. Create src/app/authors/page.tsx - All authors listing
- [x] 12. Create src/components/author/AuthorsGrid.tsx:
  - Grid of author cards
  - Avatar, name, post count
  - Link to profile
- [x] 13. Create src/components/author/AuthorCard.tsx:
  - Compact author card for grid
  - Hover effect
- [x] 14. Create src/components/author/AuthorSocial.tsx:
  - Social links with icons
  - Twitter, Facebook, Instagram, Email
- [x] 15. Create author data fetch from sm_authors with post counts

**Run notification command, then continue to Section 5**

---

## SECTION 5: Search & Discovery (15 tasks) ✅ COMPLETE
- [x] 1. Update src/app/search/page.tsx with premium layout
- [x] 2. Create src/components/search/SearchInput.tsx:
  - Large search input
  - Search icon
  - Clear button
  - Search on enter or debounced typing
- [x] 3. Create src/components/search/SearchResults.tsx:
  - Results grid
  - Highlight matching terms
  - Result count header
- [x] 4. Create src/components/search/SearchFilters.tsx:
  - Filter by category
  - Filter by date range
  - Filter by author
- [x] 5. Create src/components/search/RecentSearches.tsx:
  - Show recent searches from localStorage
  - Click to search again
  - Clear history button
- [x] 6. Create src/components/search/PopularSearches.tsx:
  - Trending search terms
  - Tag cloud style
- [x] 7. Create src/components/search/NoSearchResults.tsx:
  - Empty state
  - Suggestions to try
- [x] 8. Create src/components/search/SearchSuggestions.tsx:
  - Autocomplete dropdown
  - Shows as user types
  - Categories, authors, articles
- [x] 9. Create src/lib/search.ts:
  - Search function using Supabase
  - Full-text search on title, content
  - ilike pattern matching
- [x] 10. Create src/app/search/loading.tsx - Search loading state
- [x] 11. Add search query to URL: /search?q=bears
- [x] 12. Create src/components/search/SearchResultCard.tsx:
  - Highlighted matching text
  - Snippet with match context
- [x] 13. Create src/components/search/AdvancedSearch.tsx:
  - Expandable advanced options
  - Exact phrase, exclude words
- [x] 14. Create src/hooks/useDebounce.ts - Debounce hook for search input
- [x] 15. Add search analytics tracking placeholder

**Run notification command - SESSION 2 COMPLETE**

---

## COMPLETION CHECKLIST
When all sections are done:
- [x] All 80 tasks completed
- [x] Run: `osascript -e 'display notification "SESSION 2 FULLY COMPLETE!" with title "Claude Code"' && afplay /System/Library/Sounds/Funk.aiff`
- [x] Report completion status

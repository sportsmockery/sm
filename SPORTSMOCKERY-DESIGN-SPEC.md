# SportsMockery.com Design Specification
## Comprehensive Visual Guide for Web Designer Recreation

---

## 1. OVERALL LAYOUT STRUCTURE

### 1.1 Page Container
- **Maximum width**: 1110px
- **Centered horizontally** on screen with auto margins
- **Background**: Pure white (#ffffff) for main content area
- **Page background**: Light gray (#f5f5f5) visible on sides when viewport exceeds 1110px

### 1.2 Grid System
- **Primary grid**: 3-column layout for article cards
- **Column gap**: 16-20px horizontal spacing
- **Row gap**: 20-24px vertical spacing
- **Responsive breakpoints**:
  - Desktop: 3 columns (above 1024px)
  - Tablet: 2 columns (768px - 1024px)
  - Mobile: 1 column (below 768px)

---

## 2. COLOR PALETTE

### 2.1 Primary Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Sports Mockery Red** | #bc0000 | Primary brand color, category tags, hover states, underlines |
| **Dark Charcoal** | #222222 | Primary text, headlines, navigation text |
| **Pure Black** | #000000 | Some headlines, strong emphasis |
| **Pure White** | #ffffff | Backgrounds, text on dark/red backgrounds |

### 2.2 Secondary Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Medium Gray** | #666666 | Secondary text, metadata, dates |
| **Light Gray** | #999999 | Tertiary text, timestamps |
| **Border Gray** | #e0e0e0 | Divider lines, borders |
| **Background Gray** | #f5f5f5 | Page background, alternate sections |

### 2.3 Category-Specific Colors
| Category | Color | Usage |
|----------|-------|-------|
| Bears | #bc0000 | Category tag background |
| Bulls | #bc0000 | Category tag background |
| Cubs | #bc0000 | Category tag background |
| White Sox | #bc0000 | Category tag background |
| Blackhawks | #bc0000 | Category tag background |

*Note: All category tags use the same primary red (#bc0000) for brand consistency*

---

## 3. TYPOGRAPHY

### 3.1 Font Families
```css
/* Primary Heading Font */
font-family: 'Montserrat', sans-serif;

/* Secondary Font */
font-family: 'ABeeZee', sans-serif;

/* Body Text Font */
font-family: 'Fira Sans', sans-serif;

/* Fallback System Font */
font-family: Verdana, Geneva, sans-serif;
```

### 3.2 Font Weights
- **Bold/Black**: 700-900 (Headlines, navigation)
- **Semi-Bold**: 600 (Subheadings, emphasis)
- **Regular**: 400 (Body text, paragraphs)
- **Light**: 300 (Some metadata)

### 3.3 Font Sizes

#### Headlines
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Article Title (Single Post) | 40px | 700 | 1.2 | -0.5px |
| Card Headline (Homepage) | 18-20px | 700 | 1.3 | 0 |
| Featured Article Headline | 24-28px | 700 | 1.25 | -0.3px |
| Section Headers | 22-24px | 700 | 1.3 | 0 |

#### Body Text
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Article Body | 16px | 400 | 1.7 (27px) |
| Excerpt/Summary | 14-15px | 400 | 1.5 |
| Metadata (Date, Author) | 12-13px | 400 | 1.4 |
| Category Tags | 11-12px | 600-700 | 1 |

### 3.4 Text Colors by Context
- **Headlines on white**: #222222 or #000000
- **Body text**: #222222
- **Metadata/dates**: #666666 or #999999
- **Links (default)**: #222222
- **Links (hover)**: #bc0000
- **Text on red background**: #ffffff

---

## 4. HEADER / NAVIGATION

### 4.1 Header Structure
The header is a **sticky/fixed** element that remains at the top of the viewport when scrolling.

#### Top Header Bar
- **Height**: 50-60px
- **Background**: #ffffff (white)
- **Border bottom**: 1px solid #e0e0e0
- **Contains**: Logo (left), Social icons (right)

#### Logo
- **Position**: Left side of header
- **Text**: "SPORTS MOCKERY" in uppercase
- **Font**: Montserrat, 900 weight (Black)
- **Size**: 28-32px
- **Color**: #222222
- **Letter spacing**: 1-2px
- **Styling**: All caps, no underline

#### Main Navigation Bar
- **Height**: 50-55px
- **Background**: #ffffff (white)
- **Border bottom**: 3px solid #bc0000 (the distinctive red underline)
- **Position**: Directly below logo bar

#### Navigation Items
- **Font**: Montserrat, 700 weight
- **Size**: 14-15px
- **Color**: #222222
- **Text transform**: Uppercase
- **Letter spacing**: 0.5-1px
- **Spacing between items**: 25-30px
- **Hover state**: Text color changes to #bc0000, underline appears

#### Navigation Menu Items (Left to Right)
1. HOME
2. BEARS
3. BULLS
4. CUBS
5. WHITE SOX
6. BLACKHAWKS
7. MORE (dropdown)

#### Dropdown Menu (MORE)
- **Background**: #ffffff
- **Border**: 1px solid #e0e0e0
- **Box shadow**: 0 4px 8px rgba(0,0,0,0.1)
- **Padding**: 10px 0
- **Item padding**: 8px 20px
- **Item hover**: Background #f5f5f5

### 4.2 Search Icon
- **Position**: Right side of navigation
- **Icon**: Magnifying glass
- **Color**: #222222
- **Size**: 18-20px
- **Hover**: Color changes to #bc0000

---

## 5. HOMEPAGE LAYOUT

### 5.1 Featured Section (Top)
Located immediately below the header.

#### Featured Article (Large)
- **Width**: 100% of container (1110px)
- **Image aspect ratio**: 16:9 or similar wide format
- **Image height**: 400-500px
- **Overlay**: Semi-transparent black gradient from bottom (rgba(0,0,0,0.6))
- **Category tag**: Positioned top-left of image, 15px from edges
- **Headline**: Positioned bottom of image, over gradient
- **Headline color**: #ffffff
- **Headline size**: 28-32px

### 5.2 Article Grid Section

#### Section Header
- **Text**: Category name (e.g., "LATEST NEWS", "BEARS", etc.)
- **Font**: Montserrat, 700 weight
- **Size**: 18-20px
- **Color**: #222222
- **Text transform**: Uppercase
- **Bottom border**: 3px solid #bc0000
- **Padding bottom**: 10px
- **Margin bottom**: 20px

#### Article Cards
Arranged in a 3-column grid.

Each card contains:
1. **Image container** (top)
2. **Category tag** (overlapping image bottom-left)
3. **Headline** (below image)
4. **Metadata line** (below headline)

### 5.3 Sidebar (Right Column on Some Layouts)
- **Width**: 300-350px
- **Background**: #ffffff or #f5f5f5
- **Padding**: 20px
- **Contains**:
  - Popular posts widget
  - Advertisement slots
  - Newsletter signup
  - Social media links

---

## 6. ARTICLE CARDS (Homepage/Category Pages)

### 6.1 Card Structure
```
+---------------------------+
|                           |
|     FEATURED IMAGE        |
|     (70% aspect ratio)    |
|                           |
| [CATEGORY]                |
+---------------------------+
|                           |
| Article Headline Here     |
| That Can Span Multiple    |
| Lines If Needed           |
|                           |
| Author Name • Date        |
+---------------------------+
```

### 6.2 Card Image
- **Aspect ratio**: Approximately 70% (height is 70% of width)
- **Width**: 100% of card width
- **Object fit**: cover (image fills container, crops as needed)
- **Border radius**: 0 (no rounded corners)
- **Hover effect**: Slight zoom (transform: scale(1.02)) with transition

### 6.3 Category Tag
- **Position**: Absolute, bottom-left of image
- **Offset**: 10-15px from left edge, overlapping image/content boundary
- **Background**: #bc0000
- **Text color**: #ffffff
- **Font**: Montserrat, 700 weight
- **Size**: 10-11px
- **Text transform**: Uppercase
- **Padding**: 4px 10px
- **Letter spacing**: 0.5px

### 6.4 Card Headline
- **Font**: Montserrat, 700 weight
- **Size**: 18-20px
- **Color**: #222222
- **Line height**: 1.3
- **Margin top**: 12-15px
- **Max lines**: 3 (with ellipsis overflow)
- **Hover state**: Color changes to #bc0000, underline appears

### 6.5 Card Metadata
- **Font**: Montserrat or system font, 400 weight
- **Size**: 12-13px
- **Color**: #999999
- **Format**: "Author Name • Month Day, Year"
- **Margin top**: 8-10px

### 6.6 Card Spacing
- **Card padding**: 0 (image edge-to-edge)
- **Content padding**: 0 15px 15px 15px (text area)
- **Gap between cards**: 20px horizontal, 25px vertical
- **Card background**: #ffffff
- **Card border**: none or 1px solid #e0e0e0

---

## 7. SINGLE ARTICLE PAGE

### 7.1 Article Header
- **Width**: 100% of container (max 1110px)
- **Centered**: Yes

#### Category Tag
- **Position**: Above headline
- **Style**: Same as card category tag
- **Margin bottom**: 15px

#### Article Title
- **Font**: Montserrat, 700-900 weight
- **Size**: 36-42px
- **Color**: #222222
- **Line height**: 1.2
- **Max width**: 800-900px (for readability)
- **Margin bottom**: 15px

#### Author/Date Line
- **Font**: Montserrat, 400 weight
- **Size**: 14px
- **Color**: #666666
- **Format**: "By Author Name | Month Day, Year at Time"
- **Margin bottom**: 25px

### 7.2 Featured Image
- **Width**: 100% of content area
- **Max height**: 500-600px
- **Object fit**: cover
- **Margin bottom**: 30px

#### Image Caption (if present)
- **Font**: System font, 400 weight
- **Size**: 13px
- **Color**: #666666
- **Font style**: Italic
- **Padding**: 10px 0
- **Border bottom**: 1px solid #e0e0e0

### 7.3 Article Body
- **Max width**: 700-750px
- **Font**: Fira Sans, 400 weight
- **Size**: 16-17px
- **Color**: #222222
- **Line height**: 1.7 (approximately 27-28px)
- **Paragraph spacing**: 20-25px

#### Body Text Elements
| Element | Style |
|---------|-------|
| Paragraphs | 16px, line-height 1.7, margin-bottom 20px |
| Links | Color #bc0000, underline on hover |
| Bold text | Font-weight 700 |
| Italic text | Font-style italic |
| Block quotes | Border-left 4px solid #bc0000, padding-left 20px, italic |
| Subheadings (H2) | 24px, Montserrat, 700 weight, margin 30px 0 15px |
| Subheadings (H3) | 20px, Montserrat, 600 weight, margin 25px 0 12px |
| Lists | Standard bullets/numbers, 16px, left margin 25px |

### 7.4 Social Share Buttons
- **Position**: Below article title OR floating left sidebar
- **Icons**: Facebook, Twitter/X, Email, Copy Link
- **Icon size**: 36-40px circular buttons
- **Icon color**: #666666 or brand colors
- **Hover**: Opacity change or color intensify
- **Spacing**: 10px between icons

### 7.5 Related Articles Section
- **Position**: Below article body
- **Header**: "RELATED POSTS" or "YOU MAY ALSO LIKE"
- **Layout**: 3-column grid (same as homepage)
- **Cards**: Same style as homepage article cards
- **Margin top**: 50px
- **Border top**: 1px solid #e0e0e0
- **Padding top**: 40px

### 7.6 Comments Section
- **Position**: Below related articles
- **Background**: #f5f5f5 or #ffffff
- **Padding**: 30px
- **Comment form**: Standard input fields with #bc0000 submit button

---

## 8. CATEGORY/ARCHIVE PAGES

### 8.1 Page Header
- **Background**: #bc0000 or team-specific color
- **Height**: 150-200px
- **Text color**: #ffffff
- **Category name**: 36-42px, Montserrat, 900 weight, centered
- **Subtitle**: 14-16px, 400 weight, centered

### 8.2 Filter/Sort Bar
- **Background**: #ffffff
- **Border bottom**: 1px solid #e0e0e0
- **Height**: 50px
- **Contains**: Sort dropdown, filter options
- **Padding**: 10px 20px

### 8.3 Article Grid
- **Same as homepage**: 3-column layout
- **Pagination**: Bottom of page
- **Load more button**: Centered, #bc0000 background, white text

---

## 9. FOOTER

### 9.1 Footer Structure
```
+------------------------------------------------+
|              FOOTER TOP (Dark)                 |
|  [About]    [Categories]    [Connect]          |
+------------------------------------------------+
|              FOOTER BOTTOM (Darker)            |
|  Copyright © 2024 Sports Mockery               |
+------------------------------------------------+
```

### 9.2 Footer Top Section
- **Background**: #222222
- **Padding**: 50px 0
- **Layout**: 3-4 column grid

#### Footer Columns
Each column contains:
- **Header**: Uppercase, #ffffff, 14px, 700 weight, margin-bottom 20px
- **Links**: #999999, 14px, 400 weight, line-height 2
- **Link hover**: Color changes to #ffffff

#### Column Content
1. **About Column**
   - Site description (2-3 sentences)
   - Social media icons row

2. **Categories Column**
   - Links to all team categories
   - Links to other sections

3. **Connect/Contact Column**
   - Contact link
   - Advertise link
   - Privacy Policy link
   - Terms of Service link

### 9.3 Footer Bottom Section
- **Background**: #000000 or #111111
- **Padding**: 20px 0
- **Text**: Centered
- **Color**: #666666
- **Size**: 12-13px
- **Content**: "© 2024 Sports Mockery. All Rights Reserved."

### 9.4 Social Media Icons (Footer)
- **Icons**: Facebook, Twitter/X, Instagram, YouTube
- **Size**: 24-28px
- **Color**: #999999
- **Hover color**: #ffffff
- **Spacing**: 15px between icons
- **Alignment**: Left-aligned in about column

---

## 10. INTERACTIVE STATES

### 10.1 Hover States
| Element | Default State | Hover State |
|---------|---------------|-------------|
| Navigation links | #222222 | #bc0000 + underline |
| Article headlines | #222222 | #bc0000 + underline |
| Card images | scale(1.0) | scale(1.02) |
| Buttons | background #bc0000 | background #8a0000 (darker) |
| Footer links | #999999 | #ffffff |

### 10.2 Focus States (Accessibility)
- **Outline**: 2px solid #bc0000
- **Outline offset**: 2px
- **Applied to**: All interactive elements

### 10.3 Active States
- **Buttons**: Slight scale down (0.98)
- **Links**: Same as hover

### 10.4 Transitions
```css
/* Standard transition for all interactive elements */
transition: all 0.2s ease-in-out;

/* Image zoom transition */
transition: transform 0.3s ease;

/* Color transitions */
transition: color 0.15s ease, background-color 0.15s ease;
```

---

## 11. BUTTONS

### 11.1 Primary Button
- **Background**: #bc0000
- **Text color**: #ffffff
- **Font**: Montserrat, 700 weight
- **Size**: 14px
- **Text transform**: Uppercase
- **Padding**: 12px 25px
- **Border radius**: 0 (square corners)
- **Border**: none
- **Hover background**: #8a0000 (20% darker)

### 11.2 Secondary Button
- **Background**: transparent
- **Text color**: #bc0000
- **Border**: 2px solid #bc0000
- **Other styles**: Same as primary
- **Hover**: Background fills with #bc0000, text becomes #ffffff

### 11.3 Load More Button
- **Width**: 200-250px
- **Centered**: Yes
- **Margin**: 40px auto
- **Style**: Primary button style

---

## 12. FORMS

### 12.1 Input Fields
- **Border**: 1px solid #e0e0e0
- **Background**: #ffffff
- **Font**: System font, 400 weight
- **Size**: 14-15px
- **Padding**: 12px 15px
- **Border radius**: 0
- **Focus border**: 1px solid #bc0000

### 12.2 Search Input
- **Width**: 100% of container or 300px fixed
- **Icon**: Magnifying glass on right side
- **Placeholder text**: "Search..." in #999999

### 12.3 Newsletter Signup
- **Layout**: Email input + submit button inline
- **Input width**: 60-70%
- **Button width**: 30-40%
- **Button text**: "SUBSCRIBE" or "SIGN UP"

---

## 13. ADVERTISEMENTS

### 13.1 Ad Placements
| Location | Size | Type |
|----------|------|------|
| Header (below nav) | 728x90 | Leaderboard |
| Sidebar | 300x250 | Medium Rectangle |
| In-article | 300x250 or responsive | Medium Rectangle |
| Between article rows | 728x90 | Leaderboard |
| Footer (above) | 728x90 | Leaderboard |

### 13.2 Ad Styling
- **Border**: 1px solid #e0e0e0 (subtle)
- **Label**: "ADVERTISEMENT" in 10px, #999999, above ad
- **Margin**: 20px vertical spacing
- **Background**: #f5f5f5 (placeholder)

---

## 14. RESPONSIVE BREAKPOINTS

### 14.1 Breakpoint Values
```css
/* Desktop */
@media (min-width: 1200px) { }

/* Laptop */
@media (min-width: 1024px) and (max-width: 1199px) { }

/* Tablet Landscape */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Tablet Portrait */
@media (min-width: 600px) and (max-width: 767px) { }

/* Mobile */
@media (max-width: 599px) { }
```

### 14.2 Mobile Adaptations
- **Navigation**: Hamburger menu, slide-out drawer
- **Grid**: Single column
- **Font sizes**: Reduced by 10-15%
- **Padding**: Reduced to 15-20px
- **Card headlines**: 16-18px
- **Article title**: 28-32px

### 14.3 Tablet Adaptations
- **Grid**: 2 columns
- **Sidebar**: Hidden or below main content
- **Navigation**: May remain visible or convert to hamburger

---

## 15. MISCELLANEOUS UI ELEMENTS

### 15.1 Breadcrumbs (Category/Article Pages)
- **Position**: Below header, above content
- **Font**: 12-13px, 400 weight
- **Color**: #666666
- **Separator**: ">" or "/"
- **Link color**: #666666
- **Link hover**: #bc0000

### 15.2 Pagination
- **Style**: Numbered buttons
- **Current page**: #bc0000 background, #ffffff text
- **Other pages**: #ffffff background, #222222 text, 1px #e0e0e0 border
- **Hover**: Light gray background (#f5f5f5)
- **Button size**: 36-40px square
- **Spacing**: 5px between

### 15.3 Author Box (Single Article)
- **Position**: Below article, before related posts
- **Layout**: Avatar left, text right
- **Avatar size**: 80-100px circular
- **Author name**: 18px, 700 weight
- **Bio text**: 14px, 400 weight, #666666
- **Background**: #f5f5f5
- **Padding**: 25px
- **Border**: 1px solid #e0e0e0

### 15.4 Tags (If Used)
- **Background**: #f5f5f5
- **Text color**: #666666
- **Font size**: 12px
- **Padding**: 5px 12px
- **Border radius**: 3px (slight rounding)
- **Margin**: 5px between tags
- **Hover background**: #e0e0e0

---

## 16. LOADING STATES

### 16.1 Skeleton Loading
- **Background**: Linear gradient animation
- **Colors**: #f0f0f0 to #e0e0e0
- **Animation**: Shimmer effect left to right
- **Duration**: 1.5s infinite

### 16.2 Spinner (If Used)
- **Size**: 40px
- **Color**: #bc0000
- **Style**: Circular, spinning
- **Position**: Centered in container

---

## 17. SPECIAL SECTIONS

### 17.1 Breaking News Bar
- **Position**: Top of page, above header
- **Background**: #bc0000
- **Text color**: #ffffff
- **Height**: 35-40px
- **Font**: 13-14px, 600 weight
- **Content**: Scrolling or static breaking news text
- **Close button**: X icon on right side

### 17.2 Newsletter Popup (If Present)
- **Overlay**: rgba(0,0,0,0.5)
- **Modal background**: #ffffff
- **Width**: 500-600px max
- **Padding**: 40px
- **Close button**: Top-right, X icon
- **Heading**: 24px, centered
- **CTA button**: Full width, primary button style

---

## APPENDIX A: COMPLETE CSS VARIABLES

```css
:root {
  /* Colors */
  --color-primary: #bc0000;
  --color-primary-dark: #8a0000;
  --color-text-primary: #222222;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-background: #ffffff;
  --color-background-alt: #f5f5f5;
  --color-border: #e0e0e0;
  --color-black: #000000;
  --color-white: #ffffff;

  /* Typography */
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Fira Sans', sans-serif;
  --font-secondary: 'ABeeZee', sans-serif;

  /* Spacing */
  --spacing-xs: 5px;
  --spacing-sm: 10px;
  --spacing-md: 20px;
  --spacing-lg: 30px;
  --spacing-xl: 50px;

  /* Container */
  --container-max-width: 1110px;
  --container-padding: 15px;

  /* Grid */
  --grid-gap: 20px;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease-in-out;
  --transition-slow: 0.3s ease;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.1);

  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 3px;
  --radius-md: 5px;

  /* Z-Index Scale */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-overlay: 400;
}
```

---

## APPENDIX B: KEY MEASUREMENTS SUMMARY

| Element | Measurement |
|---------|-------------|
| Container max-width | 1110px |
| Header height (total) | 100-115px |
| Navigation item spacing | 25-30px |
| Article card image ratio | 70% height/width |
| Grid columns | 3 (desktop) |
| Grid gap | 20px |
| Article body max-width | 700-750px |
| Article body font size | 16-17px |
| Article body line height | 1.7 |
| Article title size | 36-42px |
| Card headline size | 18-20px |
| Category tag size | 10-11px |
| Footer top padding | 50px |
| Footer bottom padding | 20px |
| Button padding | 12px 25px |
| Input padding | 12px 15px |

---

*Document Version: 1.0*
*Generated: January 11, 2026*
*Source: SportsMockery.com live site analysis*

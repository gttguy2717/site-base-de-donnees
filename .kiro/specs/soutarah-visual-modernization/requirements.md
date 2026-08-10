# Requirements Document

## Introduction

This document specifies the requirements for the visual modernization of the Soutarah Group website. The modernization focuses on enhancing the visual design while maintaining existing functionality. The website is a React-based single-page application that presents company services, information, and allows users to request quotes and reserve vehicles.

The modernization will implement a refined color palette, improved typography system, enhanced spacing and layout, and modernized component styling to create a more professional and contemporary user experience.

## Glossary

- **Website**: The Soutarah Group web application built with React, Vite, and Tailwind CSS
- **Color_System**: The complete set of color values including primary, secondary, neutral, and accent colors used throughout the Website
- **Typography_System**: The hierarchical system of font families, sizes, weights, and line heights for text content
- **Spacing_System**: The consistent set of margin and padding values based on an 8-pixel grid
- **Navigation_Component**: The header navigation bar component (Navbar.jsx)
- **Hero_Section**: The main banner section on the homepage featuring the company tagline and call-to-action
- **Services_Section**: The component displaying service cards on the homepage and services page
- **Footer_Component**: The footer section containing company information and links
- **Modal_Component**: Overlay dialog components including DevisModal and CarReservationModal
- **Counter_Section**: The animated statistics display section on the homepage
- **Partners_Section**: The section displaying partner company logos
- **About_Section**: The company information preview section on the homepage
- **Video_Section**: The section containing video content or placeholder
- **CTA_Banner**: The call-to-action banner component
- **Service_Card**: Individual service display component within Services_Section
- **Viewport**: The visible area of the browser window
- **Hover_State**: The visual state of an interactive element when a cursor is positioned over it
- **Focus_State**: The visual state of an interactive element when it receives keyboard focus
- **Active_State**: The visual state of an interactive element during user interaction
- **Responsive_Breakpoint**: Screen width thresholds (mobile: <768px, tablet: 768-1024px, desktop: >1024px)
- **Animation_Duration**: The time period for a visual transition or animation effect
- **Global_Styles**: The base CSS styles defined in index.css and App.css

## Requirements

### Requirement 1: Color System Implementation

**User Story:** As a website visitor, I want to see a modern and professional color scheme throughout the site, so that I have a visually appealing and cohesive experience.

#### Acceptance Criteria

1. THE Color_System SHALL define primary colors as blue (#2563eb for primary-600 and #1e40af for primary-700)
2. THE Color_System SHALL define secondary colors as orange (#f97316 for secondary-600 and #ea580c for secondary-700)
3. THE Color_System SHALL define neutral colors ranging from gray-50 (#f9fafb) to gray-900 (#111827)
4. THE Color_System SHALL define accent colors as emerald (#059669 for success) and red (#dc2626 for error)
5. THE Navigation_Component SHALL use the primary-700 color for its background
6. THE Hero_Section SHALL use a gradient background combining primary-600 and primary-700
7. THE Service_Card SHALL use white background with primary-600 for icons
8. THE Footer_Component SHALL use gray-900 background with white text
9. THE Modal_Component SHALL use white background with gray-100 for secondary sections
10. WHEN a user hovers over a primary button, THE Website SHALL display the button in primary-700 color
11. WHEN a user hovers over a secondary button, THE Website SHALL display the button in secondary-700 color

### Requirement 2: Typography System Implementation

**User Story:** As a website visitor, I want clear and readable text with proper hierarchy, so that I can easily understand the content and navigate information.

#### Acceptance Criteria

1. THE Typography_System SHALL use Inter as the primary sans-serif font family
2. THE Typography_System SHALL use Playfair Display for decorative headings where elegant styling is needed
3. THE Typography_System SHALL define heading sizes as h1 (3rem), h2 (2.25rem), h3 (1.875rem), h4 (1.5rem), h5 (1.25rem), h6 (1rem)
4. THE Typography_System SHALL define body text size as 1rem with 1.5 line height
5. THE Typography_System SHALL define small text size as 0.875rem with 1.25 line height
6. THE Typography_System SHALL apply font-bold (700 weight) to all headings
7. THE Typography_System SHALL apply font-semibold (600 weight) to subheadings and emphasized text
8. THE Typography_System SHALL apply font-normal (400 weight) to body text
9. THE Navigation_Component SHALL use 0.875rem font size for navigation links
10. THE Hero_Section SHALL use h1 typography for the main headline
11. THE Service_Card SHALL use h3 typography for service titles and 0.875rem for descriptions
12. WHEN displaying text in Modal_Component, THE Website SHALL use h2 for modal titles and body text size for content

### Requirement 3: Spacing and Layout System

**User Story:** As a website visitor, I want consistent spacing and well-organized layouts, so that the content is easy to scan and visually balanced.

#### Acceptance Criteria

1. THE Spacing_System SHALL use an 8-pixel base unit for all spacing values
2. THE Spacing_System SHALL define standard spacing as 0.5rem (8px), 1rem (16px), 1.5rem (24px), 2rem (32px), 3rem (48px), 4rem (64px)
3. THE Website SHALL apply 4rem top and bottom padding to major sections on desktop
4. THE Website SHALL apply 2rem top and bottom padding to major sections on mobile
5. THE Service_Card SHALL use 1.5rem internal padding
6. THE Service_Card SHALL have 1rem spacing between elements
7. THE Navigation_Component SHALL have 1rem vertical padding
8. THE Footer_Component SHALL have 3rem top and bottom padding
9. THE Website SHALL maintain 1rem horizontal padding on mobile devices
10. THE Website SHALL use maximum width of 1280px for main content containers
11. WHEN displaying content in grid layout, THE Website SHALL use 2rem gap between items on desktop
12. WHEN displaying content in grid layout, THE Website SHALL use 1rem gap between items on mobile

### Requirement 4: Navigation Component Modernization

**User Story:** As a website visitor, I want a modern and intuitive navigation system, so that I can easily move between different sections of the site.

#### Acceptance Criteria

1. THE Navigation_Component SHALL use primary-700 background with white text
2. THE Navigation_Component SHALL remain fixed at the top of the Viewport during scrolling
3. THE Navigation_Component SHALL display navigation links horizontally on desktop
4. THE Navigation_Component SHALL display a hamburger menu icon on mobile devices
5. WHEN a user hovers over a navigation link, THE Navigation_Component SHALL display an underline animation with 200ms duration
6. WHEN a navigation link matches the current page, THE Navigation_Component SHALL display the link in secondary-600 color
7. WHEN a user clicks the mobile menu icon, THE Navigation_Component SHALL reveal the mobile menu with a slide-in animation
8. THE Navigation_Component SHALL include shadow-md for depth perception
9. THE Navigation_Component SHALL transition background opacity when scrolling past the Hero_Section
10. WHEN the mobile menu is open, THE Navigation_Component SHALL display navigation links vertically with 0.5rem spacing

### Requirement 5: Hero Section Enhancement

**User Story:** As a website visitor, I want an impactful and engaging hero section, so that I immediately understand the company's value proposition.

#### Acceptance Criteria

1. THE Hero_Section SHALL use a gradient background from primary-600 to primary-700
2. THE Hero_Section SHALL display white text color for all content
3. THE Hero_Section SHALL center-align all text content
4. THE Hero_Section SHALL have minimum height of 500px on desktop
5. THE Hero_Section SHALL have minimum height of 400px on mobile
6. THE Hero_Section SHALL display the main headline in h1 typography with font-bold
7. THE Hero_Section SHALL display the tagline in 1.25rem font size with reduced opacity (0.9)
8. THE Hero_Section SHALL include a primary call-to-action button with secondary-600 background
9. WHEN a user hovers over the call-to-action button, THE Hero_Section SHALL scale the button to 105% with 300ms duration
10. THE Hero_Section SHALL apply fade-in animation to content with 800ms duration on page load
11. WHERE a hero image exists, THE Hero_Section SHALL display the image with subtle zoom animation on load

### Requirement 6: Service Cards Styling

**User Story:** As a website visitor, I want visually appealing service cards, so that I can easily understand the different services offered.

#### Acceptance Criteria

1. THE Service_Card SHALL use white background with shadow-lg
2. THE Service_Card SHALL use rounded-xl border radius (0.75rem)
3. THE Service_Card SHALL have 1.5rem internal padding
4. THE Service_Card SHALL display service icons in primary-600 color at 3rem size
5. THE Service_Card SHALL display service titles in h3 typography with gray-900 color
6. THE Service_Card SHALL display service descriptions in 0.875rem font size with gray-600 color
7. WHEN a user hovers over a Service_Card, THE Service_Card SHALL elevate with shadow-2xl
8. WHEN a user hovers over a Service_Card, THE Service_Card SHALL translate upward by 4px with 300ms duration
9. THE Service_Card SHALL include a "Learn More" link in primary-600 color
10. WHEN a user hovers over the "Learn More" link, THE Service_Card SHALL display an arrow icon animation

### Requirement 7: Modal Components Enhancement

**User Story:** As a website visitor, I want clear and modern modal dialogs for forms and interactions, so that I can easily complete actions like requesting quotes.

#### Acceptance Criteria

1. THE Modal_Component SHALL use white background with rounded-lg border radius
2. THE Modal_Component SHALL display over a dark overlay with 0.5 opacity
3. THE Modal_Component SHALL center itself within the Viewport
4. THE Modal_Component SHALL have maximum width of 600px
5. THE Modal_Component SHALL include 2rem internal padding
6. THE Modal_Component SHALL display a close button in the top-right corner with gray-600 color
7. WHEN a Modal_Component opens, THE Website SHALL apply fade-in animation with 200ms duration
8. WHEN a Modal_Component opens, THE Website SHALL apply scale-in animation from 95% to 100%
9. WHEN a user clicks outside the Modal_Component, THE Website SHALL close the modal
10. WHEN a user presses the Escape key, THE Website SHALL close the modal
11. THE Modal_Component SHALL display form labels in font-semibold with gray-700 color
12. THE Modal_Component SHALL style input fields with gray-300 border and rounded-md corners
13. WHEN an input field receives focus, THE Modal_Component SHALL display primary-600 border color

### Requirement 8: Footer Component Redesign

**User Story:** As a website visitor, I want an informative and well-structured footer, so that I can find company contact information and important links.

#### Acceptance Criteria

1. THE Footer_Component SHALL use gray-900 background with white text
2. THE Footer_Component SHALL have 3rem top and bottom padding
3. THE Footer_Component SHALL display content in a multi-column grid on desktop
4. THE Footer_Component SHALL display content in a single column on mobile
5. THE Footer_Component SHALL include company logo with white color variant
6. THE Footer_Component SHALL display footer links in gray-300 color
7. WHEN a user hovers over a footer link, THE Footer_Component SHALL display the link in secondary-600 color with 200ms transition
8. THE Footer_Component SHALL include social media icons in 1.5rem size
9. THE Footer_Component SHALL display copyright information in 0.75rem font size with gray-400 color
10. THE Footer_Component SHALL separate the copyright section with a gray-800 border top

### Requirement 9: Button Styling System

**User Story:** As a website visitor, I want clear and interactive buttons, so that I understand what actions I can take and receive visual feedback.

#### Acceptance Criteria

1. THE Website SHALL define primary button style with primary-600 background and white text
2. THE Website SHALL define secondary button style with secondary-600 background and white text
3. THE Website SHALL define outline button style with transparent background and primary-600 border
4. THE Website SHALL apply rounded-lg border radius to all buttons
5. THE Website SHALL apply 0.75rem vertical and 1.5rem horizontal padding to buttons
6. THE Website SHALL apply font-semibold weight to button text
7. WHEN a user hovers over a primary button, THE Website SHALL change background to primary-700 with 200ms transition
8. WHEN a user hovers over a secondary button, THE Website SHALL change background to secondary-700 with 200ms transition
9. WHEN a user hovers over an outline button, THE Website SHALL fill background with primary-600 and change text to white
10. WHEN a button is in disabled state, THE Website SHALL apply gray-400 background and reduce opacity to 0.6
11. WHEN a button receives focus, THE Website SHALL display a 2px primary-600 outline with 2px offset
12. THE Website SHALL apply shadow-md to buttons for depth perception

### Requirement 10: Counter Section Animation

**User Story:** As a website visitor, I want engaging animated statistics, so that I can see the company's achievements in a dynamic way.

#### Acceptance Criteria

1. THE Counter_Section SHALL use gray-50 background color
2. THE Counter_Section SHALL display counters in a grid layout with equal columns
3. THE Counter_Section SHALL display counter numbers in 3rem font size with primary-600 color
4. THE Counter_Section SHALL display counter labels in 1rem font size with gray-600 color
5. WHEN the Counter_Section enters the Viewport, THE Website SHALL animate counter numbers from 0 to target value
6. THE Counter_Section SHALL complete number animations within 2000ms duration
7. THE Counter_Section SHALL use easing function for smooth number transitions
8. THE Counter_Section SHALL include appropriate icons above each counter in 2rem size
9. THE Counter_Section SHALL apply fade-in animation to each counter with staggered timing
10. THE Counter_Section SHALL maintain proper spacing of 2rem between counter items on desktop

### Requirement 11: Partners Section Styling

**User Story:** As a website visitor, I want to see partner logos displayed professionally, so that I understand the company's business relationships.

#### Acceptance Criteria

1. THE Partners_Section SHALL use white background
2. THE Partners_Section SHALL display section title in h2 typography centered above logos
3. THE Partners_Section SHALL arrange partner logos in a responsive grid
4. THE Partners_Section SHALL display 4 logos per row on desktop
5. THE Partners_Section SHALL display 2 logos per row on tablet
6. THE Partners_Section SHALL display 1 logo per row on mobile
7. THE Partners_Section SHALL apply grayscale filter to partner logos by default
8. WHEN a user hovers over a partner logo, THE Partners_Section SHALL remove grayscale filter with 300ms transition
9. WHEN a user hovers over a partner logo, THE Partners_Section SHALL scale the logo to 110%
10. THE Partners_Section SHALL apply 1rem gap between logos
11. THE Partners_Section SHALL limit logo height to 80px while maintaining aspect ratio

### Requirement 12: Form Input Styling

**User Story:** As a website visitor, I want clear and accessible form inputs, so that I can easily provide information when requesting quotes or services.

#### Acceptance Criteria

1. THE Website SHALL style text inputs with gray-300 border and white background
2. THE Website SHALL apply rounded-md border radius to form inputs
3. THE Website SHALL apply 0.75rem vertical and 1rem horizontal padding to inputs
4. THE Website SHALL display input labels in 0.875rem font size with gray-700 color above inputs
5. WHEN an input receives focus, THE Website SHALL display primary-600 border with 2px width
6. WHEN an input receives focus, THE Website SHALL display a subtle shadow-sm
7. WHEN an input contains invalid data, THE Website SHALL display red-500 border
8. WHEN an input contains invalid data, THE Website SHALL display error message in red-500 color below input
9. THE Website SHALL style select dropdowns consistently with text inputs
10. THE Website SHALL style textarea inputs with minimum height of 120px
11. THE Website SHALL display placeholder text in gray-400 color with 0.875rem font size
12. WHEN an input is disabled, THE Website SHALL apply gray-100 background and gray-400 text color

### Requirement 13: Responsive Design Implementation

**User Story:** As a website visitor on any device, I want the site to look great and function properly, so that I have a consistent experience regardless of screen size.

#### Acceptance Criteria

1. THE Website SHALL adapt layout for mobile devices with Viewport width less than 768px
2. THE Website SHALL adapt layout for tablet devices with Viewport width between 768px and 1024px
3. THE Website SHALL adapt layout for desktop devices with Viewport width greater than 1024px
4. WHEN displayed on mobile, THE Website SHALL stack all grid layouts into single columns
5. WHEN displayed on tablet, THE Website SHALL display grid layouts in 2 columns where applicable
6. WHEN displayed on desktop, THE Website SHALL display grid layouts in 3 or 4 columns based on content
7. WHEN displayed on mobile, THE Website SHALL reduce heading font sizes by 20%
8. WHEN displayed on mobile, THE Website SHALL reduce section padding from 4rem to 2rem
9. WHEN displayed on mobile, THE Navigation_Component SHALL hide desktop menu and show hamburger icon
10. THE Website SHALL maintain minimum touch target size of 44px by 44px for interactive elements on mobile
11. THE Website SHALL ensure horizontal scrolling never occurs on any Responsive_Breakpoint
12. THE Website SHALL scale images responsively while maintaining aspect ratios

### Requirement 14: Animation and Transition System

**User Story:** As a website visitor, I want smooth animations and transitions, so that the interface feels polished and responsive to my interactions.

#### Acceptance Criteria

1. THE Website SHALL apply 200ms transition duration to color changes
2. THE Website SHALL apply 300ms transition duration to transform operations
3. THE Website SHALL apply 150ms transition duration to opacity changes
4. THE Website SHALL use ease-in-out timing function for all transitions
5. WHEN an element enters the Viewport, THE Website SHALL apply fade-in animation with 600ms duration
6. WHEN an element enters the Viewport, THE Website SHALL apply slide-up animation moving 20px upward
7. THE Website SHALL stagger animations for multiple elements with 100ms delay between each
8. THE Website SHALL respect user's prefers-reduced-motion setting and disable animations accordingly
9. WHEN a page loads, THE Website SHALL apply progressive reveal animations to sections
10. THE Website SHALL limit concurrent animations to maintain 60fps performance
11. WHEN a user hovers over interactive elements, THE Website SHALL complete hover transitions within 200ms

### Requirement 15: Accessibility and Focus States

**User Story:** As a website visitor using keyboard navigation or assistive technologies, I want clear focus indicators and accessible interactions, so that I can navigate and use the site effectively.

#### Acceptance Criteria

1. WHEN an interactive element receives keyboard focus, THE Website SHALL display a visible 2px outline in primary-600 color
2. THE Website SHALL maintain focus outline offset of 2px from element boundary
3. THE Website SHALL ensure minimum color contrast ratio of 4.5:1 for all text content
4. THE Website SHALL ensure minimum color contrast ratio of 3:1 for large text (18px+)
5. THE Website SHALL provide focus indicators for all interactive elements including links, buttons, and form inputs
6. THE Website SHALL maintain logical focus order following visual layout
7. THE Website SHALL trap keyboard focus within Modal_Component when open
8. WHEN a Modal_Component closes, THE Website SHALL return focus to the trigger element
9. THE Website SHALL provide skip-to-content link for keyboard users
10. THE Website SHALL ensure all icons have appropriate aria-labels or text alternatives
11. THE Website SHALL support keyboard navigation for all interactive features including mobile menu

### Requirement 16: Global Style Optimization

**User Story:** As a website visitor, I want consistent styling across all pages, so that the entire site feels unified and professionally designed.

#### Acceptance Criteria

1. THE Global_Styles SHALL reset default browser styles using modern CSS reset
2. THE Global_Styles SHALL apply box-sizing border-box to all elements
3. THE Global_Styles SHALL set base font-size to 16px on html element
4. THE Global_Styles SHALL apply smooth scrolling behavior to html element
5. THE Global_Styles SHALL define CSS custom properties for all Color_System values
6. THE Global_Styles SHALL define CSS custom properties for all Spacing_System values
7. THE Global_Styles SHALL define CSS custom properties for common border-radius values
8. THE Global_Styles SHALL define CSS custom properties for shadow variations
9. THE Website SHALL reference CSS custom properties throughout component styles
10. THE Global_Styles SHALL apply anti-aliasing to all text for improved readability
11. WHERE browser supports it, THE Global_Styles SHALL enable subpixel rendering for text

### Requirement 17: Performance and Loading States

**User Story:** As a website visitor, I want fast page loads and clear loading indicators, so that I know the site is working and don't experience frustrating delays.

#### Acceptance Criteria

1. WHEN images are loading, THE Website SHALL display a gray-200 placeholder background
2. WHEN content is loading, THE Website SHALL display skeleton loading animations
3. THE Website SHALL apply lazy loading to images below the fold
4. THE Website SHALL optimize all CSS by removing unused styles in production build
5. THE Website SHALL inline critical CSS for above-the-fold content
6. THE Website SHALL defer non-critical CSS loading
7. WHEN a user action triggers a data request, THE Website SHALL display loading state within 100ms
8. THE Website SHALL compress all image assets to optimal size while maintaining visual quality
9. THE Website SHALL use modern image formats (WebP) where browser supports it
10. THE Website SHALL implement CSS containment for independent components to optimize rendering


# RC Drift Sync Agent Instructions

# RC Drift Sync project instructions

This app is an RC drift tuning web app. Treat it as a serious mobile-first tuning tool, not a generic SaaS app.

Default priorities:
1. Preserve existing functionality.
2. Do not add new features unless explicitly asked.
3. Improve accuracy, usability, polish, QA, accessibility, and mobile experience.
4. Use RC drift terminology carefully.
5. Favor mobile-first layouts.
6. Keep desktop usable but do not build a separate desktop experience.
7. Avoid generic UI language.
8. Keep animations subtle, useful, performant, and respectful of reduced-motion.
9. Run available lint, typecheck, tests, and build before finalizing.
10. Summarize changes, QA performed, and remaining risks.

Allowed:
- Reorganizing existing UI
- Relabeling
- Improving copy
- Improving theme
- Improving animations
- Fixing bugs
- Improving responsiveness
- Improving accessibility
- Refactoring existing components
- Improving existing calculations or explanations when supported by credible RC drift references

Not allowed unless explicitly requested:
- New major features
- New app sections
- New calculators
- New databases
- New auth/payment flows
- New AI features
- New telemetry
- New desktop-specific app
- Fake tuning claims
- Generic template redesigns

## Product Identity

RC Drift Sync is a mobile-first RC drift tuning platform.

It helps RC drift drivers:
- save car tunes
- build Basic Tunes
- build Advanced Tunes
- store ESC, servo, gyro, and radio settings
- export setup sheets as PDFs
- share tunes
- clone other drivers' tunes
- browse community setups
- visualize car setups
- manage their RC drift garage

RC Drift Sync should feel like a real RC drift product made for people at the track.

It should feel like:
- RC drift garage
- pit lane tuning tool
- digital setup notebook
- race setup companion
- community tune library
- setup sheet generator
- mobile motorsport product

It should NOT feel like:
- generic SaaS dashboard
- startup admin panel
- analytics dashboard
- CRM
- finance app
- plain database UI
- AI-generated template
- random Tailwind demo
- default shadcn app

## Highest Priority

Mobile-first usability is mandatory.

Most users will use RC Drift Sync on phones at RC drift tracks.

Prioritize:
- fast navigation
- large touch targets
- clear section flow
- sticky save/share actions
- readable forms
- simple tune summaries
- clean dark mode
- usable light mode
- no dead buttons
- no fake UI
- no confusing navigation

Desktop is secondary.

## Design Quality Rules

The app must not look AI-generated.

Avoid common AI/SaaS patterns:
- generic "Welcome back" dashboards
- random gradient hero sections
- fake analytics cards
- meaningless charts
- repeated identical cards
- generic white cards everywhere
- plain blue SaaS buttons
- purple gradient startup styling
- placeholder badges
- generic feature tiles
- forms generated directly from a database schema
- cluttered dashboard widgets
- admin-table layouts on mobile
- excessive glassmorphism
- excessive glow effects
- random emoji
- buttons that exist only to fill space

Every screen must answer:
1. What is the user trying to do here?
2. What is the primary action?
3. What is the secondary action?
4. What can be hidden?
5. What would an RC drift user call this?

## Visual Direction

Use a premium RC drift / motorsport style.

Preferred style:
- dark graphite backgrounds
- charcoal surfaces
- subtle carbon-fiber inspiration
- red accent for primary action/energy
- blue accent for secondary/community/info
- amber only for warnings
- green only for success
- clean racing/pit-lane feel
- strong typography hierarchy
- polished cards
- useful visual summaries
- focused mobile screens

Avoid:
- generic white dashboard cards everywhere
- default SaaS blue buttons
- random gradients
- inconsistent colors
- cluttered neon
- decorative elements with no purpose
- tiny text
- tiny buttons
- low contrast
- unreadable dark mode
- unreadable light mode

## Mobile-First Rules

Design mobile first on every UI change.

Requirements:
- large touch targets
- bottom navigation
- sticky primary action buttons where needed
- no tiny controls
- no desktop tables on mobile
- no horizontal overflow
- no cramped sections
- no wall of form fields
- use tabs, chips, accordions, cards, and bottom sheets
- keep important actions near the thumb zone
- make dropdowns easy to tap
- make text readable
- test small phone widths
- test large phone widths

If a screen is hard to use on a phone, it is not done.

## Main Navigation

Use clear bottom navigation:

- Home
- Garage
- Tune Builder
- Community
- Profile

Each page must have:
- clear title
- clear purpose
- clear primary action
- clear secondary action if needed
- clear back behavior
- no dead ends
- no mystery buttons

Do not bury important actions.

## Button Rules

Every button must have a real function.

Before keeping or adding a button, verify:
- What does it do?
- Does it work?
- Does it save, navigate, open, export, clone, share, filter, delete, or preview?
- Does it have a loading state if needed?
- Does it have a disabled state if needed?
- Does the disabled state explain why?
- Is the label clear?

Remove or fix:
- dead buttons
- placeholder buttons
- duplicate buttons
- fake actions
- unclear icon-only buttons
- buttons that do nothing
- buttons that navigate nowhere
- buttons that silently fail

Use clear labels:
- Save Tune
- Preview Setup Sheet
- Export PDF
- Clone to My Garage
- Share Tune
- Add Car
- Create Tune
- Log Track Session
- Compare Tunes
- Add Photo
- Remove Photo
- Edit Setup
- Delete Tune

Avoid vague labels:
- Submit
- Manage
- Continue when unclear
- Update Record
- Open Item
- Data
- Configuration
- Entity

## Tune Builder Rules

The Tune Builder is the most important part of the app.

It must not feel like a giant database form.

Tune Builder sections:
- Basic
- Front
- Rear
- Drivetrain
- ESC
- Servo
- Gyro
- Radio
- Photos
- Notes
- Preview/PDF

Required behavior:
- Clicking Basic shows only Basic fields.
- Clicking Front shows only Front setup fields.
- Clicking Rear shows only Rear setup fields.
- Clicking Drivetrain shows only Drivetrain fields.
- Clicking ESC shows only ESC fields.
- Clicking Servo shows only Servo fields.
- Clicking Gyro shows only Gyro fields.
- Clicking Radio shows only Radio fields.
- Clicking Photos shows only photo fields.
- Clicking Notes shows only note fields.
- Clicking Preview/PDF shows only preview/export content.
- Do not show the full form unless there is an intentional "All Sections" mode.

Tune Builder must:
- preserve data while switching sections
- not lose unsaved input
- show active section clearly
- support sticky Save
- support sticky Preview PDF where appropriate
- keep Basic Tune simple
- keep Advanced Tune organized
- avoid overwhelming users
- use section progress where possible

## Basic Tune Rules

Basic Tune is for fast setup logging.

It should be simple, high-impact, and beginner-friendly.

Basic Tune should focus on:
- chassis selection
- deck
- front damper brand
- front spring brand
- front spring
- front knuckle
- front axle
- front wheel brand
- front lower arm
- lower front arm shims
- front toe block
- servo brand
- servo tune dropdown
- gyro brand
- gyro tune dropdown
- motor
- ESC brand
- ESC tune dropdown
- rear lower arm
- lower rear arm shims
- rear hub carrier
- rear axle length
- rear wheel brand
- rear toe block
- customizations / notes

Basic Tune should NOT show:
- exact camber
- exact caster
- exact KPI
- detailed toe angle tuning unless needed
- shock piston details
- deep ESC timing fields
- deep servo deadband fields
- deep gyro curve fields
- official PDF coordinate mapping
- admin tools

Basic Tune should use:
- dropdowns
- Custom / Other
- recently used values
- saved electronics tune profiles
- simple helper text
- clean section cards

## Advanced Tune Rules

Advanced Tune is for detailed setup work.

Advanced Tune can include:
- alignment
- shocks
- drivetrain
- weight balance
- body/aero
- detailed ESC settings
- detailed servo settings
- detailed gyro settings
- radio settings
- official PDF fields
- RDX / MC-3 specific fields
- universal setup sheet fields

Advanced Tune should still be organized and mobile-friendly.

Do not dump all advanced fields on one screen.

## Basic / Advanced Data Sync

Basic Tune and Advanced Tune must use the same underlying data when they refer to the same real part or setting.

Do not create duplicate unrelated fields like:
- basicFrontSpring
- advancedFrontSpring
- frontSpringValue

Use shared objects.

Example:
frontSetup.spring.brand
frontSetup.spring.model
frontSetup.spring.rate
frontSetup.spring.length
frontSetup.spring.notes

If a user edits a shared field in Basic Tune, Advanced Tune should reflect it.
If a user edits a shared field in Advanced Tune, Basic Tune should reflect it.

Advanced-only data should stay in advanced-specific sections.

## RC Drift Language Rules

Use real RC drift language.

Good:
- Create Tune
- Save Setup
- Clone to My Garage
- Front Setup
- Rear Setup
- Rear Grip
- ESC Tune
- Servo Tune
- Gyro Tune
- Track Session
- Setup Sheet
- PDF Preview
- What changed?
- How did the car feel?

Avoid:
- Configuration
- Entity
- Record
- Database Item
- Submit
- Form Entry
- Object Details
- Manage Records

Add helper text for beginner terms:
- Front Knuckle: "The steering knuckle/upright used on the front suspension."
- Toe Block: "The suspension mount/block that affects toe angle."
- Shims: "Small spacers used to raise, lower, or move suspension arms."
- ESC Tune: "Your saved speed controller settings for this tune."
- Servo Tune: "Your saved steering servo settings for this tune."
- Gyro Tune: "Your saved gyro settings for this tune."

## Product Catalog Rules

The product catalog must be accurate and trustworthy.

Do not invent fake products.
Do not claim the catalog is complete.
Always allow Custom / Other.
Only mark products verified when there is a reliable source.

Categorize products by what the product actually is, not by keywords in the name.

Known issue to avoid:
Do not put a Yokomo RTR kit into the Gyro category just because the product name says it includes a gyro.

Correct:
- Standalone gyro -> gyro
- RTR kit with gyro included -> chassis or kit, not gyro

Dropdowns must only show standalone products for that category.

Examples:
- Gyro dropdown shows only standalone gyros.
- ESC dropdown shows only standalone ESCs.
- Motor dropdown shows only standalone motors.
- Servo dropdown shows only standalone servos.
- Wheel dropdown shows only wheels/rims.
- Tire dropdown shows only tires.
- Knuckle dropdown shows only steering knuckles/uprights.
- Rear hub carrier dropdown shows only rear hub carriers.

Do not show:
- RTR kits in gyro/ESC/motor/servo dropdowns
- motor mounts in motor dropdowns
- ESC fan covers in ESC dropdowns
- servo horns in servo dropdowns
- chassis kits in parts dropdowns
- bundles in standalone product dropdowns

Use needsReview for uncertain items.

Catalog items should support:
- brand
- productName
- simplifiedName
- displayName
- partNumber
- category
- productType
- compatibleChassis
- sourceUrl
- verified
- confidence
- needsReview
- categorizationReason
- excludedCategories
- notes
- discontinued
- userAdded

## Simplified Product Naming Rules

Product names shown to users should be simple and readable.

Use this format:
Simple Product Name (Part Number)

Examples:
- Drift Steering Gyro (DP-302V4)
- RDX Graphite Front Upper Arm (D1-008FUG)
- DC10 Drift Car Kit (30134)
- Front Lower Arm Set (D1-008FLM)
- Aluminum Front Upper Arm Type-2 Purple (OD2940)

Store both:
- original productName from source
- simplifiedName for UI
- partNumber
- displayName

Do not show long retailer-style product titles in normal UI.

Remove unnecessary words:
- For 1/10 RC Drift Car
- Replacement Option Part
- High Performance
- Upgrade Parts
- Genuine
- Plastic Model RC Car
- repeated brand names
- long compatibility lists
- SEO wording

Keep important details:
- product type
- material
- color
- size
- length
- version
- side
- part number

Do not invent part numbers.

If part number is unknown, do not show empty parentheses.

## Product Category Validation Rules

Before saving or importing catalog data, validate category accuracy.

Rules:
- RTR kits are not individual electronics.
- Bundles are not standalone parts.
- Mounts are not the part they mount.
- Accessories are not main products.
- Shims/spacers are not suspension arms.
- Arms are not shims.
- Knuckles are not rear hubs.
- Rear hubs are not knuckles.
- Wheels and tires are separated unless clearly mounted sets.
- Uncertain products are marked needsReview.
- Duplicate part numbers are flagged.
- Same product under multiple categories is flagged unless intentional.

Admin tools should allow:
- correcting category
- editing simplified name
- marking verified/unverified
- marking needsReview
- merging duplicates
- approving suggestions
- rejecting suggestions
- importing/exporting JSON or CSV

## PDF Export Rules

Users should fill out mobile-friendly forms.
The app should generate PDFs from saved data.

Do not force normal users to type directly onto tiny PDF lines.

For official templates:
- RDX and MC-3 use their own separate PDF mappings.
- Do not assume RDX and MC-3 have the same layout.
- Use official PDFs as backgrounds/templates.
- Do not redraw official sheet lines.
- Do not remove original labels.
- Stamp user data onto the correct locations.

For universal templates:
- Generate a clean RC Drift Sync universal setup PDF.
- Include chassis setup, electronics setup, notes, and QR code if available.

PDF preview and export must work on mobile.

## Visualization Rules

Where useful, prefer visual summaries over walls of text.

Good visual ideas:
- Basic Tune summary card
- front/rear/electronics grouped summary
- generic chassis diagram
- highlighted setup zones
- PDF preview card
- changed fields highlight
- compare tune summary
- shareable tune card
- QR card

Do not force users to read a wall of fields when a visual summary would help.

## Community UI Rules

Community should feel like RC drift sharing, not a SaaS data table.

Community tune cards should show:
- tune name
- chassis
- driver
- track/surface
- tire
- rating
- likes
- clone count
- key parts
- View button
- Clone button

Use:
- mobile-friendly cards
- filter chips
- bottom-sheet filters
- search
- visual tune summaries

Avoid:
- spreadsheets
- generic rows
- fake metrics
- cluttered filters
- confusing icons

## Component Rules

Create and reuse consistent components.

Prefer:
- AppShell
- MobileBottomNav
- PageHeader
- TuneCard
- CarCard
- BasicTuneSummary
- ChassisVisualMap
- TuneSectionTabs
- StickyActionBar
- BottomSheet
- ProductDropdown
- ElectronicsProfileCard
- PDFPreviewCard
- ShareTuneCard
- CommunityTuneCard
- EmptyState
- LoadingSkeleton
- SuccessToast
- ConfirmDialog

Do not create slightly different versions of the same component everywhere.

Cards should have:
- clear title
- useful metadata
- one primary action
- optional secondary action
- consistent spacing
- consistent radius
- consistent typography
- no clutter

## Form Rules

Forms should feel guided, not generated.

Rules:
- group related fields
- hide advanced fields
- use dropdowns where useful
- always include Custom / Other when catalog may be incomplete
- use helper text only where useful
- avoid showing too many fields at once
- preserve input
- autosave if supported
- show saved state
- show validation clearly

Error messages should be human.

Bad:
Invalid input.

Good:
Enter a number for rear axle length, or leave it blank if you are not sure.

## Empty State Rules

No blank pages.

Use friendly empty states.

Garage:
"Add your first RC drift car to start saving tunes."

Tunes:
"No tunes yet. Create a baseline setup for your next track day."

Community:
"Public tunes will appear here once drivers start sharing."

Profile:
"Share a tune to start building your driver profile."

PDF:
"Fill out a few setup fields to preview your setup sheet."

## Accessibility Rules

Every UI change must consider accessibility.

Check:
- readable contrast
- visible focus states
- buttons have accessible names
- form inputs have labels
- icons are not the only explanation
- modals/bottom sheets are usable
- text size is readable on mobile
- tap targets are large enough
- disabled states are clear

## Code Quality Rules

Keep the codebase modular.

Avoid:
- giant components
- duplicated form logic
- duplicated field definitions
- duplicated Basic/Advanced state
- hardcoded repeated UI
- dead code
- unused components
- inconsistent naming
- confusing folder structure

Prefer:
- reusable components
- shared field definitions
- shared validation helpers
- catalog service/helpers
- PDF generation modules
- clear data models
- separate UI and data logic

Do not rewrite the entire app unless necessary.
Refactor where it directly improves usability, maintainability, or correctness.

## Testing and QA Rules

After any meaningful change, run available checks.

Run these if available:
- npm run lint
- npm run build
- npm test
- npm run test
- Playwright tests if configured

If commands are missing, report that they are missing.

Always manually verify:
- mobile viewport
- dark mode
- light mode
- Tune Builder section tabs
- Save behavior
- data reload
- every changed button
- empty states
- loading states
- error states

## UI Change QA Checklist

For UI/UX changes, verify:

Navigation:
- Home works.
- Garage works.
- Tune Builder works.
- Community works.
- Profile works.

Tune Builder:
- each section tab shows only its section
- Basic mode works
- Advanced mode works
- Save works
- Preview PDF works if implemented
- Export PDF works if implemented
- data is not lost when switching sections

Buttons:
- every visible button works
- no placeholder buttons remain
- disabled buttons explain why

Mobile:
- small phone screen works
- large phone screen works
- scrolling works
- sticky bottom nav works
- sticky save actions work
- dropdowns are easy to tap
- bottom sheets are usable

Visual:
- no generic SaaS look
- no AI-generated template feel
- spacing is consistent
- typography is readable
- dark mode is polished
- light mode is readable

Data:
- create tune
- edit tune
- reload tune
- create car
- edit car
- share if implemented
- clone if implemented

## Work Report Requirements

After completing a task, report:
1. What changed
2. Files changed
3. Tests/checks run
4. Any errors
5. Known issues
6. Recommended next step

If something could not be fixed, say so clearly.

## Final Standard

RC Drift Sync should feel like a real RC drift tuning app designed for real RC drift users.

It should not look like:
- a generic AI-generated app
- a SaaS dashboard
- an admin panel
- a database form
- a random UI template

Every screen should feel intentional, mobile-friendly, and useful at the track.

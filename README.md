# Vuedeo

A cyberpunk-styled video library manager built with Vue 3 and Vite. Import, organize, and watch your video collections with a beautiful neon-themed interface.

## Features

- 🎥 Import video collections from CSV and HTML files
- 🏷️ Tag-based organization with dynamic filtering
- 🎨 Cyberpunk UI with neon effects
- 📱 Responsive grid layout
- 💾 Persistent storage with localStorage
- 🎬 Video playback support for various platforms
- 🌈 Modern, accessible interface

## Components

### Core Components

#### [ImportSection](src/components/ImportSection.vue)
Handles file imports with a modern, cyberpunk-styled interface. Supports CSV and HTML imports with file persistence and validation.
- File selection with drag & drop
- Import progress feedback
- File type validation
- Persistent file selection

#### [VideoGrid](src/components/VideoGrid.vue)
Displays video cards in a responsive grid layout with configurable columns.
- Adaptive grid sizing
- Empty state handling
- Integrates with tag filtering

#### [VideoCard](src/components/VideoCard.vue)
Individual video card component with cover image, title, tags, and metadata.
- Fallback image handling
- Tag display
- Creation date formatting
- Note preview

#### [TagsFilter](src/components/TagsFilter.vue)
Dynamic tag filtering system with count indicators and disabled states.
- Active state visualization
- Tag count indicators
- Disabled state for unused tags
- Smart tag sorting by usage

#### [VideoModal](src/components/VideoModal.vue)
Video playback modal with iframe embedding and fallback options.
- Embedded video player
- Fallback to external links
- Video metadata display
- Error handling for restricted embeds

### Layout Components

#### [Navbar](src/components/Navbar.vue)
Application navigation and settings control.
- Grid column adjustment
- Settings menu
- Responsive design

#### [Layout](src/components/Layout.vue)
Main application layout wrapper.
- Flexible content area
- Router view integration

## Styling

### [_home.scss](src/assets/styles/_home.scss)
Main application styles with cyberpunk theme integration.
- Component-specific styles
- Grid layouts
- Animation effects
- Responsive design

### [cyberpunk.scss](src/assets/styles/cyberpunk.scss)
Cyberpunk theme definition with neon effects and color scheme.
- Theme variables
- Neon glow effects
- Color palette
- Typography

## Views

#### [Home](src/views/Home.vue)
Main application view with import functionality and video grid.
- File import handling
- Video filtering
- Tag management
- Local storage integration

#### [Playlist](src/views/Playlist.vue)
Playlist view for grouped video playback.
- Sequential video playback
- Playlist navigation
- Video source detection

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Dependencies

- Vue 3
- Vue Router
- Papa Parse (CSV parsing)
- PrimeIcons
- SASS
- Vite

## Development

### Project Structure
```
src/
  ├── assets/
  │   └── styles/
  │       ├── cyberpunk.scss
  │       └── home.scss
  ├── components/
  │   ├── ImportSection.vue
  │   ├── VideoCard.vue
  │   ├── VideoGrid.vue
  │   ├── TagsFilter.vue
  │   └── VideoModal.vue
  ├── views/
  │   ├── Home.vue
  │   └── Playlist.vue
  └── router/
      └── index.js
```

### Build
```bash
npm run build
```

## Features in Detail

### File Import
- Supports CSV and HTML imports
- Persistent file selection
- Import validation
- Error handling with user feedback

### Video Management
- Tag-based organization
- Dynamic filtering
- Grid layout customization
- Video metadata display

### Tag System
- Dynamic tag filtering
- Count-based tag visibility
- Active/inactive states
- Smart sorting by usage

### UI/UX
- Cyberpunk theme with neon effects
- Responsive grid layout
- Smooth animations
- Error feedback
- Loading states

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

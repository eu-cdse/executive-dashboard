# CDSE Executive Dashboard

> An interactive analytics dashboard for visualizing Copernicus Data Space Ecosystem (CDSE) satellite data metrics.

## Overview

The CDSE Executive Dashboard is a modern React/TypeScript web application that provides comprehensive visualization and monitoring of satellite data operations from the Copernicus Data Space Ecosystem. The dashboard presents key performance indicators, service metrics, and mission insights through interactive charts, timelines, and geospatial maps.

**Key Features:**

- 📊 Real-time metrics visualization (bar charts, pie charts, timelines, histograms)
- 🗺️ Interactive geospatial data display with Leaflet
- 🎯 Service monitoring and performance analytics
- 🛰️ Mission-specific data snapshots
- 🔗 Deep linking support for sharing dashboard states
- 📱 Responsive design with dark mode support
- ⚡ Optimized performance with lazy loading and code splitting

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Charts:** Chart.js with custom plugins
- **Maps:** Leaflet + React-Leaflet
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **HTTP Client:** Axios

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cdas-public-app

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Access the application at http://localhost:5173
```

### Building

```bash
# Production build
npm run build

# Development build
npm run build:dev

# Test environment build
npm run build:test

# Preview production build
npm run preview
```

### Linting

```bash
npm run lint
```

## Configuration

The application uses environment variables to control features and API endpoints. Create a `.env` file in the root directory:

```env
# Configuration URL for metrics and codelists
VITE_CONFIGURATION_URL=https://your-config-endpoint.com

# Feature flags
VITE_INCLUDE_LOGIN=false
VITE_OPTION_TEMP_DATA=false
VITE_INCLUDE_STAGE_SUBPAGE=false
```

### Environment Variables

| Variable                     | Description                                                        | Default  |
| ---------------------------- | ------------------------------------------------------------------ | -------- |
| `VITE_CONFIGURATION_URL`     | Base URL for metric configurations and satellite product codelists | Required |
| `VITE_INCLUDE_LOGIN`         | Enable/disable login screen                                        | `false`  |
| `VITE_OPTION_TEMP_DATA`      | Enable temporary data options for testing                          | `false`  |
| `VITE_INCLUDE_STAGE_SUBPAGE` | Show/hide staging-specific panels                                  | `false`  |

## Project Structure

```
src/
├── components/        # Reusable UI components (charts, tables, maps)
├── containers/        # Layout components and panel containers
├── store/            # Zustand state management
├── routes/           # Routing configuration
├── functions/        # Utilities, API clients, data processors
├── hooks/            # Custom React hooks
├── animations/       # Framer Motion animation configs
├── auth/            # Authentication components
├── types/           # TypeScript type definitions
└── assets/          # Static assets and configurations
```

## Architecture

### State Management

The application uses Zustand for state management with two primary stores:

- **ConfigurationStore:** Manages metric configurations and codelists fetched from the configuration URL
- **DataStore:** Handles application-wide state including selected time periods, filters, and user preferences

### Metrics System

Each metric follows the `MetricInfo` interface defining:

- API query conditions (time periods, filters)
- Codelist references for satellite product classifications
- Visualization type (bar, pie, timeline, histogram)
- Display properties (units, decimals, grouping rules)

### Data Processing Flow

1. Raw API data is fetched via `src/functions/api.ts`
2. Data processors in `src/functions/process/processor.tsx` transform it into chart-ready formats
3. Components render visualizations using the unified `<Chart>` component

### Deep Linking

The dashboard supports deep linking to share specific dashboard configurations. Widget states are encoded in URL parameters as base64 JSON, allowing users to share exact views.

## Deployment

### Staging

Automatic deployment from the `main` branch to the staging environment.

### Production

Manual deployment via tagged releases following semantic versioning (`v*.*.+`).

### Compression

Production builds automatically compress assets (gzip and brotli) for optimal loading performance.

## Development Guidelines

### Component Patterns

- Use functional components with TypeScript
- Leverage custom hooks for reusable logic
- Follow the existing barrel export pattern (`index.ts` files)
- Use path aliases (`@/`) for imports

### Styling

- Use Tailwind utility classes
- Follow the existing color scheme and spacing patterns
- Ensure responsive design works on mobile, tablet, and desktop

### Chart Development

- Extend the unified `<Chart>` component for new visualizations
- Add chart configurations to `src/common/getChartStyles.ts`
- Implement data processors for new metric types

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:

- Passes ESLint checks (`npm run lint`)
- Follows the existing code style
- Includes appropriate TypeScript types
- Works across different screen sizes

## Acknowledgments

This project visualizes data from the [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/), Europe's eyes on Earth.

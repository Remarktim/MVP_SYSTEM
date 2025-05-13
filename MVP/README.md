# MVP Community Connect App

This project is a community issue-tracking application built with React, Vite, and Supabase.

## Key Features

- User authentication with Supabase
- Dashboard for viewing community issues
- Admin interface for managing issues and users
- Report submission and tracking
- Before/after image comparison

## Technical Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **Backend/Auth**: Supabase
- **Icons**: Lucide React, Hero Icons
- **Charts**: Recharts

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Updating Dependencies

If you need to update the project dependencies, follow these steps:

1. Remove existing node_modules and package-lock.json:

   ```
   rm -rf node_modules package-lock.json
   ```

2. Update package.json with specific versions (not ranges) to ensure compatibility:

   ```json
   "dependencies": {
     "@heroicons/react": "2.0.18",
     "@supabase/supabase-js": "2.38.4",
     "lucide-react": "0.290.0",
     "react": "18.2.0",
     "react-dom": "18.2.0",
     "react-icons": "4.11.0",
     "react-router-dom": "6.18.0",
     "recharts": "2.9.3"
   }
   ```

3. Install the updated dependencies:

   ```
   npm install
   ```

4. Test the application thoroughly after updating dependencies.

## Recent Updates and Fixes

- Updated React to version 18.2.0 for better stability
- Fixed React Router configuration to match v6.18 standards
- Improved authentication flow and admin role checking
- Removed client-side admin privileged functions for security
- Enhanced loading states and error handling
- Fixed image loading issues with proper fallbacks
- Optimized component rendering and reduced layout shifts
- Resolved memory leak issues in async functions

## Building for Production

```
npm run build:production
```

## License

[MIT License](LICENSE)

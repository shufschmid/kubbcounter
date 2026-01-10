# Complete Project Prompt: Kubb Counter Web Application

## Master Prompt

Create a Next.js web application called "Kubb Counter" that connects to Airtable to store game data, hosted on Netlify with serverless functions. The app should track Kubb game statistics with the following specifications:

---

## Core Features

### 1. Setup Screen
- Display a setup form with three configuration options:
  - **Player Name:** Two buttons to choose between "Samuel" and "Isabelle"
  - **Distance:** Two buttons to choose between "4 Meter" and "8 Meter"
  - **Quantity of Throws:** Two buttons to choose between 50 and 100 throws
- Include a large green "Start" button to begin the game session
- Record the start time when the game begins

### 2. Game Screen
- Display **only**:
  - A timer showing elapsed time since start (MM:SS format)
  - Two large buttons:
    - Green "HIT" button
    - Red "MISS" button
- No statistics, no throw counters, no progress indicators on this screen
- Track each button press internally
- Calculate and track hit/miss streaks in the background
- When the selected quantity of throws is reached, automatically proceed to check for records

### 3. Celebration Screen (Conditional)
- Check historical Airtable records for the current player and distance
- Show celebration screen **only if** any of these records are broken:
  - **Longest Hit Streak:** Best consecutive hits for this player + distance
  - **Highest Hit Percentage:** Best percentage for this player + distance
  - **Most Total Hits:** Best total hits for this player + distance + quantity combination
- Display:
  - Vibrant gradient background (yellow → orange → red)
  - Large animated "NEW RECORD!" text with bounce animation
  - Animated celebration GIF (https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif)
  - List of broken records with trophy emojis
  - Auto-advance to statistics screen after 5 seconds
- If no records broken, skip directly to statistics screen

### 4. Statistics Screen
- Display comprehensive game results:
  - **Player name** and **game settings** (distance, quantity)
  - **Hits:** Total successful throws (green)
  - **Misses:** Total missed throws (red)
  - **Hit Percentage:** Success rate with 1 decimal place (blue)
  - **Longest Hit Streak:** Consecutive hits (yellow)
  - **Longest Miss Streak:** Consecutive misses (purple)
  - **Total Time:** Complete session duration in MM:SS format (indigo)
  - **Time per Throw:** Average time per throw in seconds with 1 decimal place (teal)
- Include a large "Submit Result" button
- On submit:
  - Save all statistics to Airtable
  - Show success message
  - Return to setup screen after 2 seconds

---

## Technical Requirements

### Technology Stack
- **Frontend:** Next.js 15+ with TypeScript, React 19, Tailwind CSS
- **Backend:** Netlify serverless functions
- **Database:** Airtable
- **Hosting:** Netlify with automatic deployments

### Airtable Integration

#### Configuration
- API Key: `your_airtable_api_key`
- Base ID: `your_airtable_base_id`
- Table Name: `Kubb`

#### Table Schema
Create an Airtable table with these fields:
1. `Player Name` (Single line text)
2. `Distance` (Single line text)
3. `Quantity` (Number)
4. `Hits` (Number)
5. `Misses` (Number)
6. `Hit Percentage` (Number with 2 decimal places)
7. `Longest Hit Streak` (Number)
8. `Longest Miss Streak` (Number)
9. `Duration (seconds)` (Number)
10. `Start Time` (Date with time)
11. `End Time` (Date with time)

### Netlify Functions

#### Function 1: `record.ts`
- **Purpose:** Save game session results to Airtable
- **Endpoint:** `POST /.netlify/functions/record`
- **Input:** All game statistics (player, distance, quantity, hits, misses, percentages, streaks, duration, timestamps)
- **Output:** Success confirmation with record ID

#### Function 2: `get-records.ts`
- **Purpose:** Fetch historical records for comparison
- **Endpoint:** `GET /.netlify/functions/get-records`
- **Query Params:** `playerName`, `distance`, `quantity`
- **Output:** Maximum values for hit streak, hit percentage, and total hits

### Project Structure
```
kubbcounter/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main app with all screens
│   └── globals.css         # Global styles with Tailwind
├── netlify/
│   └── functions/
│       ├── record.ts       # Save results function
│       └── get-records.ts  # Fetch historical records function
├── .env.local              # Local environment variables (not in git)
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore file
├── netlify.toml            # Netlify configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── package.json            # Dependencies
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # Project documentation
```

### Environment Variables
```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=Kubb
```

### Dependencies
```json
{
  "dependencies": {
    "next": "^15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "airtable": "^0.12.2",
    "@netlify/functions": "^2.8.2"
  },
  "devDependencies": {
    "@netlify/plugin-nextjs": "^5.7.4",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "^15.1.3"
  }
}
```

---

## User Experience Flow

1. **Setup Phase:**
   - User selects player, distance, and throw quantity
   - Clicks "Start" to begin session
   - App records start time

2. **Game Phase:**
   - User sees only timer and two buttons
   - Clicks "HIT" or "MISS" for each throw
   - Timer updates every second
   - No feedback shown until completion

3. **Completion:**
   - After final throw, app fetches historical records
   - Compares current results with past records
   - If records broken → Shows celebration (5 seconds)
   - Proceeds to statistics screen

4. **Statistics Phase:**
   - User reviews all statistics
   - Clicks "Submit Result" to save to Airtable
   - Returns to setup screen for next game

---

## Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Run with Netlify Dev (required for functions)
netlify dev

# Access at http://localhost:8888
```

### Deployment to Netlify
1. Push code to GitHub repository
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Netlify auto-detects configuration from `netlify.toml`
5. Deploy automatically on push to main branch

### Build Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"

[functions]
  directory = "netlify/functions"
```

---

## Design Guidelines

### Colors & Styling
- **Setup Screen:** Clean white form on gray background
- **Game Screen:** Minimal gray background with timer
- **Celebration Screen:** Vibrant gradient (yellow → orange → red)
- **Statistics Screen:** Clean white cards on gray background

### Button Specifications
- **HIT Button:** Green (bg-green-500), 256x256px, large text
- **MISS Button:** Red (bg-red-500), 256x256px, large text
- **Start Button:** Green, full width, large text
- **Submit Button:** Blue, full width, large text

### Animations
- Celebration title: Bounce animation
- Record messages: Pulse animation
- All buttons: Scale down on click (active:scale-95)
- Loading spinners: Rotating animation

---

## Key Implementation Notes

1. **Timer Management:** Use React `useEffect` with `setInterval` to update elapsed time every second
2. **Streak Calculation:** Track consecutive hits/misses as throws are recorded
3. **Record Checking:** Compare only against player's own records for their chosen distance
4. **Error Handling:** Gracefully handle Airtable connection errors, skip celebration if fetch fails
5. **Auto-advance:** Use `setTimeout` for 5-second celebration screen
6. **State Management:** Use React hooks for all state (no external state library)
7. **Responsive Design:** Use Tailwind responsive classes (sm:, md:, etc.)

---

## Success Criteria

- ✅ App runs locally with `netlify dev`
- ✅ Setup screen allows player, distance, and quantity selection
- ✅ Game screen shows only timer and buttons
- ✅ Timer updates every second during game
- ✅ Celebration appears when records are broken
- ✅ Statistics screen shows all required metrics
- ✅ Data successfully saves to Airtable
- ✅ App deploys to Netlify without errors
- ✅ Functions work in production environment
- ✅ Responsive design works on mobile and desktop

---

## Airtable Prompt for AI Setup

```
Create a table called "Kubb" to track Kubb game sessions with the following fields:

1. Player Name - Single line text field to store the player's name
2. Distance - Single line text field to store the throwing distance (e.g., "4 Meter" or "8 Meter")
3. Quantity - Number field (integer) to store the total number of throws in the session
4. Hits - Number field (integer) to store the number of successful hits
5. Misses - Number field (integer) to store the number of misses
6. Hit Percentage - Number field with 2 decimal places to store the hit success rate as a percentage
7. Longest Hit Streak - Number field (integer) to store the longest consecutive hits
8. Longest Miss Streak - Number field (integer) to store the longest consecutive misses
9. Duration (seconds) - Number field (integer) to store the total session duration in seconds
10. Start Time - Date field with time to record when the session started
11. End Time - Date field with time to record when the session ended

Please create this table with appropriate field types and formatting for tracking game statistics.
```

---

This prompt contains all requirements to build the complete Kubb Counter application from scratch.

# Kubb Counter

A Next.js web application for tracking Kubb game statistics with player setup, throw tracking, and comprehensive statistics. Data is stored in Airtable and deployed to Netlify.

## Features

- **Setup Screen**: Select player name (Samuel/Isabelle), distance (4m/8m), and throw quantity (50/100)
- **Game Screen**: Two large buttons (Green "HIT" and Red "MISS") with real-time throw tracking
- **Statistics Screen**: Comprehensive results including:
  - Number of hits and misses
  - Hit percentage
  - Longest hit streak
  - Longest miss streak
  - Session duration
- Serverless function integration via Netlify Functions
- Responsive design with Tailwind CSS
- Automatic session completion after reaching throw quantity

## Prerequisites

- Node.js 20 or higher
- An Airtable account
- A Netlify account

## Airtable Setup

1. Go to [Airtable](https://airtable.com) and create a new base
2. Create a table named `Kubb` (or your preferred name)
3. Add the following fields to your table:
   - `Player Name` (Single line text)
   - `Distance` (Single line text)
   - `Quantity` (Number)
   - `Hits` (Number)
   - `Misses` (Number)
   - `Hit Percentage` (Number with 2 decimal places)
   - `Longest Hit Streak` (Number)
   - `Longest Miss Streak` (Number)
   - `Duration (seconds)` (Number)
   - `Start Time` (Date with time)
   - `End Time` (Date with time)
4. Get your Airtable credentials:
   - API Key: Go to Account → API → Generate API key
   - Base ID: Found in the API documentation for your base (starts with `app...`)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables template:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` and add your Airtable credentials:
```
AIRTABLE_API_KEY=your_actual_api_key
AIRTABLE_BASE_ID=your_actual_base_id
AIRTABLE_TABLE_NAME=Kubb
```

4. Install Netlify CLI for local testing:
```bash
npm install -g netlify-cli
```

5. Run the development server with Netlify functions:
```bash
netlify dev
```

6. Open [http://localhost:8888](http://localhost:8888) in your browser

## Deploy to Netlify

### Option 1: Deploy via Netlify CLI

1. Login to Netlify:
```bash
netlify login
```

2. Initialize the site:
```bash
netlify init
```

3. Set environment variables in Netlify:
```bash
netlify env:set AIRTABLE_API_KEY your_actual_api_key
netlify env:set AIRTABLE_BASE_ID your_actual_base_id
netlify env:set AIRTABLE_TABLE_NAME Kubb
```

4. Deploy:
```bash
netlify deploy --prod
```

### Option 2: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Netlify will auto-detect the settings from `netlify.toml`
6. Add environment variables:
   - Go to Site settings → Environment variables
   - Add `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_NAME`
7. Click "Deploy site"

## Project Structure

```
kubbcounter/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with buttons
│   └── globals.css         # Global styles
├── netlify/
│   └── functions/
│       └── record.ts       # Serverless function for Airtable
├── .env.local              # Local environment variables (not in git)
├── .env.example            # Environment variables template
├── netlify.toml            # Netlify configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## How It Works

1. **Setup Phase**:
   - User selects player name, distance, and throw quantity
   - Clicks "Start" to begin the game session
   - Start time is recorded

2. **Game Phase**:
   - User clicks "HIT" or "MISS" for each throw
   - Counters update in real-time showing current hits/misses
   - Progress tracker shows throws completed out of total
   - When quantity is reached, automatically moves to statistics screen

3. **Statistics Phase**:
   - App calculates and displays:
     - Total hits and misses
     - Hit percentage
     - Longest consecutive hit streak
     - Longest consecutive miss streak
   - User clicks "Submit Result"
   - Frontend sends POST request to `/.netlify/functions/record` with complete session data
   - Netlify serverless function saves all statistics to Airtable
   - After successful submission, app returns to setup screen for next session

## Troubleshooting

### Functions not working locally
- Make sure you're using `netlify dev` instead of `next dev`
- Check that your `.env.local` file has the correct Airtable credentials

### Deployment errors
- Verify environment variables are set in Netlify dashboard
- Check build logs in Netlify for specific error messages
- Ensure your Airtable table name matches the `AIRTABLE_TABLE_NAME` variable

### Button clicks not recording
- Check browser console for errors
- Verify Airtable credentials are correct
- Check Netlify function logs in the Netlify dashboard

## License

MIT

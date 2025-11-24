# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets API integration for the Lexus Club Malaysia membership lookup site.

## Step 1: Prepare Your Google Sheet

1. **Open your existing Google Sheet** or create a new one
2. **Ensure your sheet has the following columns** (in order):
   - Column A: `Member Since`
   - Column B: `Name`
   - Column C: `License Plate`
   - Column D: `Car Color`
   - Column E: `State`

3. **Make sure the first row contains these exact headers**

4. **Get your Sheet ID**:
   - Your Google Sheet URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part (between `/d/` and `/edit`)
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Step 2: Create Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. **Create a New Project** (or select existing):
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it "Lexus Club Malaysia" (or any name)
   - Click "Create"

3. **Enable Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key
   - Click "Restrict Key" (recommended)

5. **Restrict API Key** (optional but recommended):
   - Under "API restrictions", select "Restrict key"
   - Check "Google Sheets API"
   - Under "Website restrictions", add your GitHub Pages URL:
     - Example: `https://yourusername.github.io/*`
   - Click "Save"

## Step 3: Make Your Sheet Public

Your sheet must be publicly viewable (read-only) for the API to access it:

1. Open your Google Sheet
2. Click "Share" button (top right)
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Click "Done"

**Note**: Anyone with the link can view the data, but only authorized users can edit it.

## Step 4: Update Your Code

Edit `script.js` and replace the following values:

```javascript
// Google Sheets Configuration
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your actual Sheet ID
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API Key
const SHEET_NAME = 'Sheet1'; // Replace if your sheet has a different name
```

### Example:
```javascript
const SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
const API_KEY = 'AIzaSyDaGmWU4JVHdGw9bAJbQ1hZ2xYz1234567';
const SHEET_NAME = 'Members'; // If your sheet tab is named "Members"
```

## Step 5: Test Locally

1. Open `index.html` in your browser
2. You should see the search interface
3. Try searching for a license plate number from your sheet
4. If it works, you'll see the member card with all fields

### Troubleshooting:

**"Failed to connect to Google Sheets"**
- Check that your API Key is correct
- Verify that Google Sheets API is enabled in your Google Cloud project
- Make sure your sheet is set to "Anyone with the link can view"

**"Failed to load member data"**
- Check that your Sheet ID is correct
- Verify that SHEET_NAME matches your actual sheet tab name
- Open browser console (F12) to see detailed error messages

**CORS errors**
- The Google Sheets API should work from any domain
- If you get CORS errors, ensure you're accessing via HTTP/HTTPS (not file://)
- Use a local web server like Live Server extension in VS Code

## Step 6: Deploy to GitHub Pages

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Google Sheets integration"
   git branch -M main
   git remote add origin https://github.com/yourusername/lexus-club-malaysia.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings"
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be available at: `https://yourusername.github.io/lexus-club-malaysia/`

3. **Update API Key Restrictions** (if you set them):
   - Go back to Google Cloud Console
   - Update the website restrictions with your actual GitHub Pages URL

## Features

### ✅ What Works Now:

1. **N/A Display**: Empty fields automatically show as "N/A" with italic styling
2. **Edit Mode**: Click "Edit Missing Info" to update N/A fields
3. **Real-time Updates**: Changes save directly to Google Sheets
4. **All Visitors Can Edit**: Anyone can update missing information
5. **Smart Color Matching**: Recognizes various color descriptions (e.g., "Ultrasonic Blue Mica" → blue car image)

### 🎨 Member Card Fields:

- Member Since (editable if N/A)
- Name (editable if N/A)
- License Plate (not editable - used for search)
- Car Color (editable if N/A)
- State (editable if N/A)

## Security Considerations

⚠️ **Important Notes**:

1. **Read-only API Key**: The API key only allows reading the sheet data
2. **Write Access**: To enable editing, we use the Google Sheets API's update method
3. **Public Editing**: Anyone with the link can edit N/A fields
4. **No Authentication**: This is intentional for simplicity, but consider adding authentication for production

### Optional: Add Authentication

If you want to restrict who can edit, you can:
1. Use Google Sign-In
2. Add a password protection layer
3. Use Google Apps Script to create a protected API endpoint

Let me know if you need help implementing any of these!

## Support

If you encounter any issues:
1. Check the browser console for error messages (F12 → Console tab)
2. Verify all configuration values are correct
3. Test the Google Sheet API directly: `https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/Sheet1!A:E?key=YOUR_API_KEY`
4. Ensure your sheet is publicly accessible

Happy coding! 🚗✨

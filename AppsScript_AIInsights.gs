// Google Apps Script for AI Insights
// Deploy this as a separate web app and update APPS_SCRIPT_INSIGHTS_URL in script.js

// ============================================
// CONFIGURATION - ADD YOUR API KEY HERE
// ============================================
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Get from https://aistudio.google.com/
const SHEET_ID = '1WOrbFw6DMuYmP0FocbO_CGpVe39zPpk9B_bz_w7cFJ8';
const SHEET_NAME = 'Members List';

// Main entry point for web app
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getInsights') {
      return generateInsights();
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Generate AI insights
function generateInsights() {
  try {
    // Get sheet data
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No member data found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Extract headers and rows
    const headers = data[0];
    const rows = data.slice(1);
    
    // Calculate metrics
    const metrics = calculateMetrics(headers, rows);
    
    // Check if API key is configured
    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      // Return mock insights without calling AI
      const mockInsights = generateMockInsights(metrics);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        insights: mockInsights,
        metrics: metrics
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Call Gemini API
    const aiInsights = callGeminiAPI(metrics);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      insights: aiInsights,
      metrics: metrics
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error generating insights: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Calculate metrics from sheet data
function calculateMetrics(headers, rows) {
  const timestampIndex = headers.indexOf('Timestamp');
  const locationIndex = headers.indexOf('Location');
  const colorIndex = headers.indexOf('Car Color');
  
  // Calculate date 3 months ago
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // 1. Count new members in last 3 months
  let newMembers = 0;
  const recentMembers = [];
  
  rows.forEach(row => {
    if (row[timestampIndex]) {
      const memberDate = new Date(row[timestampIndex]);
      if (memberDate >= threeMonthsAgo) {
        newMembers++;
        recentMembers.push(row);
      }
    }
  });
  
  // 2. Find most common state (all time)
  const stateCounts = {};
  rows.forEach(row => {
    const state = row[locationIndex];
    if (state && state.trim() !== '') {
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    }
  });
  
  const topState = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const topStateCount = stateCounts[topState] || 0;
  
  // 3. Find favorite color in last 3 months
  const recentColorCounts = {};
  recentMembers.forEach(row => {
    const color = row[colorIndex];
    if (color && color.trim() !== '') {
      recentColorCounts[color] = (recentColorCounts[color] || 0) + 1;
    }
  });
  
  const favoriteColor = Object.entries(recentColorCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const favoriteColorCount = recentColorCounts[favoriteColor] || 0;
  
  // 4. Count members with modifications (proxy for edits)
  let totalEdits = 0;
  const mod1Index = headers.indexOf('Mod1');
  
  if (mod1Index !== -1) {
    rows.forEach(row => {
      for (let i = 0; i < 10; i++) {
        if (row[mod1Index + i] && row[mod1Index + i].toString().trim() !== '') {
          totalEdits++;
          break; // Count member once if they have any mods
        }
      }
    });
  }
  
  return {
    newMembers,
    totalMembers: rows.length,
    topState,
    topStateCount,
    favoriteColor,
    favoriteColorCount,
    totalEdits,
    threeMonthsAgo: threeMonthsAgo.toDateString()
  };
}

// Call Gemini API
function callGeminiAPI(metrics) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are analyzing membership data for Lexus 4IS Club Malaysia, a community of Lexus IS 4th generation enthusiasts.

Current Statistics:
- Total Members: ${metrics.totalMembers}
- New Members (last 3 months): ${metrics.newMembers}
- Most Popular State: ${metrics.topState} (${metrics.topStateCount} members)
- Favorite Color (last 3 months): ${metrics.favoriteColor} (${metrics.favoriteColorCount} members)
- Members with Modifications: ${metrics.totalEdits}

Generate a friendly, engaging 50-word summary that highlights these key insights about the club's growth and community trends. Focus on the positive aspects and community engagement. Keep it conversational and enthusiastic.`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    
    if (json.candidates && json.candidates[0] && json.candidates[0].content) {
      const aiText = json.candidates[0].content.parts[0].text;
      return aiText;
    } else {
      Logger.log('Unexpected API response: ' + response.getContentText());
      return generateMockInsights(metrics);
    }
  } catch (error) {
    Logger.log('Error calling Gemini API: ' + error.toString());
    return generateMockInsights(metrics);
  }
}

// Generate mock insights (fallback)
function generateMockInsights(metrics) {
  return `The Lexus 4IS Club Malaysia community continues to thrive with ${metrics.newMembers} new members joining in the past three months. ${metrics.topState} leads in membership with ${metrics.topStateCount} enthusiasts, while ${metrics.favoriteColor} has emerged as the most popular color choice. ${metrics.totalEdits} members have actively customized their profiles, showcasing the community's passion.`;
}

// Test function (run this to test without deploying)
function testInsights() {
  const result = generateInsights();
  Logger.log(result.getContent());
}

// DOM Elements
const plateInput = document.getElementById('plateInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const errorMessage = document.getElementById('errorMessage');
const errorPlate = document.getElementById('errorPlate');
const memberCard = document.getElementById('memberCard');
const loadingIndicator = document.getElementById('loadingIndicator');
const downloadBtn = document.getElementById('downloadBtn');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Member data elements
const memberSince = document.getElementById('memberSince');
const memberName = document.getElementById('memberName');
const memberPlate = document.getElementById('memberPlate');
const memberColor = document.getElementById('memberColor');
const memberState = document.getElementById('memberState');
const memberModel = document.getElementById('memberModel');
const carImage = document.getElementById('carImage');
const verificationDate = document.getElementById('verificationDate');

// Input elements
const inputMemberSince = document.getElementById('inputMemberSince');
const inputMemberName = document.getElementById('inputMemberName');
const inputMemberColor = document.getElementById('inputMemberColor');
const inputMemberState = document.getElementById('inputMemberState');
const inputMemberModel = document.getElementById('inputMemberModel');

// Google Sheets Configuration
const SHEET_ID = '1WOrbFw6DMuYmP0FocbO_CGpVe39zPpk9B_bz_w7cFJ8'; // Replace with your Google Sheet ID
const API_KEY = 'AIzaSyCzjGbnauiwyvD2As31QosJaM7QLQZKHj8'; // Replace with your Google API Key
const SHEET_NAME = 'Members List'; // Live tab connected to Google Form
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydzJIjyGiMnbA5eaWbk1FS_nvcErIBagiHWFDfizPs0A6dl8Vpu_9OAYoSCRxniGC8/exec';
const APPS_SCRIPT_INSIGHTS_URL = 'https://script.google.com/macros/s/AKfycbwwQ9yfMKLM_LzgHdkNp0O9axB5INVGPtzXn0TwqrF3oyVjTef5wBEDZUNMVfXvk7Ff/exec'; // Will be set after deploying insights script

// Member data cache
let membersData = [];
let currentMember = null;
let currentRowIndex = -1;
let isEditMode = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleSheetsAPI();
    setupEventListeners();
});

// Load Google Sheets API
function loadGoogleSheetsAPI() {
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });
            await loadSheetData();
        } catch (error) {
            console.error('Error loading Google Sheets API:', error);
            alert('Failed to connect to Google Sheets. Please check your configuration.');
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Search button click
    searchBtn.addEventListener('click', performSearch);
    
    // Search button touch (iOS)
    searchBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        performSearch();
    });
    
    // Enter key on input
    plateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', downloadCard);
    downloadBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        downloadCard();
    });
    
    // Edit button
    editBtn.addEventListener('click', enterEditMode);
    editBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        enterEditMode();
    });
    
    // Save button
    saveBtn.addEventListener('click', saveChanges);
    saveBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        saveChanges();
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', cancelEdit);
    cancelBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        cancelEdit();
    });
    
    // Auto-uppercase input
    plateInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
    
    // Dashboard toggle
    const dashboardToggle = document.getElementById('dashboardToggle');
    const dropdownIcon = document.getElementById('dropdownIcon');
    const statsGrid = document.getElementById('statsGrid');
    
    if (dashboardToggle && dropdownIcon && statsGrid) {
        dashboardToggle.addEventListener('click', () => {
            if (statsGrid.style.display === 'none') {
                statsGrid.style.display = 'grid';
                dropdownIcon.classList.add('open');
            } else {
                statsGrid.style.display = 'none';
                dropdownIcon.classList.remove('open');
            }
        });
    }
}

// Load Sheet Data
async function loadSheetData() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${SHEET_NAME}!A:P`,
        });
        
        const rows = response.result.values;
        if (!rows || rows.length === 0) {
            console.error('No data found in sheet');
            return;
        }
        
        // First row is headers
        const headers = rows[0].map(h => h.trim());
        console.log('Column headers:', headers);
        
        // Convert to array of objects
        membersData = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const member = {};
            headers.forEach((header, index) => {
                member[header] = row[index] || '';
            });
            member._rowIndex = i + 1; // Store actual row number (1-indexed, +1 for header)
            membersData.push(member);
        }
        
        console.log(`Loaded ${membersData.length} members from Google Sheets`);
        console.log('First member sample:', membersData[0]);
        console.log('All license plates:', membersData.map(m => m['License Plate']));
        
        // Update dashboard statistics
        updateDashboard();
        
        // Load AI insights
        loadInsights();
    } catch (error) {
        console.error('Error loading sheet data:', error);
        alert('Failed to load member data. Please check your Sheet ID and API Key.');
    }
}

// Update Dashboard Statistics
function updateDashboard() {
    // Count total members
    const totalMembers = membersData.length;
    document.getElementById('totalMembers').textContent = totalMembers;
    
    // Count members by state
    const stateCounts = {};
    membersData.forEach(member => {
        const state = member['Location'] || 'Unknown';
        if (state && state.trim() !== '') {
            stateCounts[state] = (stateCounts[state] || 0) + 1;
        }
    });
    
    // Sort states by count (descending)
    const sortedStates = Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1]);
    
    // Populate stats grid
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';
    
    sortedStates.forEach(([state, count]) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.innerHTML = `
            <span class="stat-state">${state}</span>
            <span class="stat-count">${count}</span>
        `;
        statsGrid.appendChild(statItem);
    });
    
    // Update top modders
    updateTopModders();
}

// Update Top Modders
function updateTopModders() {
    // Count modifications for each member
    const membersWithMods = membersData.map(member => {
        let modCount = 0;
        for (let i = 1; i <= 10; i++) {
            const modKey = `Mod${i}`;
            const modValue = member[modKey] || '';
            if (modValue.trim() !== '') {
                modCount++;
            }
        }
        return { member, modCount };
    }).filter(item => item.modCount > 0) // Only members with modifications
      .sort((a, b) => b.modCount - a.modCount) // Sort by mod count descending
      .slice(0, 5); // Top 5
    
    const topModdersSection = document.getElementById('topModdersSection');
    const topModdersGrid = document.getElementById('topModdersGrid');
    
    if (membersWithMods.length === 0) {
        topModdersSection.style.display = 'none';
        return;
    }
    
    topModdersSection.style.display = 'block';
    topModdersGrid.innerHTML = '';
    
    membersWithMods.forEach((item, index) => {
        const { member, modCount } = item;
        const rank = index + 1;
        
        // Calculate stars
        const fullStars = Math.floor(modCount / 2);
        const hasHalfStar = modCount % 2 === 1;
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '⭐';
        }
        if (hasHalfStar) {
            starsHTML += '🌟';
        }
        
        const card = document.createElement('div');
        card.className = 'top-modder-card';
        card.innerHTML = `
            <div class="top-modder-rank rank-${rank}">${rank}</div>
            <div class="top-modder-name">${member['Name'] || 'Anonymous'}</div>
            <div class="top-modder-plate">${member['License Plate'] || 'N/A'}</div>
            <div class="top-modder-mods">
                <div class="top-modder-stars">${starsHTML}</div>
                <div class="top-modder-count">${modCount} mods</div>
            </div>
        `;
        
        // Click to view full profile
        card.addEventListener('click', () => {
            plateInput.value = member['License Plate'] || '';
            performSearch();
        });
        
        topModdersGrid.appendChild(card);
    });
}

// Perform Search
async function performSearch() {
    const plateNumber = plateInput.value.trim().toUpperCase();
    
    if (!plateNumber) {
        alert('Please enter a plate number');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Search for member
    const memberIndex = membersData.findIndex(m => 
        m['License Plate'] && m['License Plate'].toUpperCase().replace(/\s+/g, '') === plateNumber.replace(/\s+/g, '')
    );
    
    hideLoading();
    
    if (memberIndex !== -1) {
        currentMember = membersData[memberIndex];
        currentRowIndex = currentMember._rowIndex;
        displayMemberCard(currentMember);
    } else {
        displayError(plateNumber);
    }
}

// Display Member Card
function displayMemberCard(member) {
    // Hide error, show card
    errorMessage.style.display = 'none';
    memberCard.style.display = 'block';
    resultsContainer.style.display = 'block';
    
    // Reset edit mode
    exitEditMode();
    
    // Helper function to display value or N/A
    const displayValue = (value) => value && value.trim() !== '' ? value : 'N/A';
    const isNA = (value) => !value || value.trim() === '';
    
    // Populate card data
    const memberSinceVal = displayValue(member['Timestamp']);
    memberSince.textContent = memberSinceVal;
    memberSince.classList.toggle('na', isNA(member['Timestamp']));
    
    // Calculate and display tenure stars
    displayTenureStars(member['Timestamp']);
    
    const memberNameVal = displayValue(member['Name']);
    memberName.textContent = memberNameVal;
    memberName.classList.toggle('na', isNA(member['Name']));
    
    memberPlate.textContent = member['License Plate'] || 'N/A';
    
    const memberColorVal = displayValue(member['Car Color']);
    memberColor.textContent = capitalizeWords(memberColorVal);
    memberColor.classList.toggle('na', isNA(member['Car Color']));
    
    const memberStateVal = displayValue(member['Location']);
    memberState.textContent = memberStateVal;
    memberState.classList.toggle('na', isNA(member['Location']));
    
    const memberModelVal = displayValue(member['Model']);
    memberModel.textContent = memberModelVal;
    memberModel.classList.toggle('na', isNA(member['Model']));
    
    // Display modifications
    displayModifications(member);
    
    // Show modifications section
    const modsSection = document.querySelector('.modifications-section');
    if (modsSection) {
        modsSection.style.display = 'block';
    }
    
    // Set car image based on color
    setCarImage(member['Car Color']);
    
    // Set verification date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    verificationDate.textContent = `Verified: ${formattedDate}`;
    
    // Scroll to results
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Set Car Image
function setCarImage(colorValue) {
    if (!colorValue || colorValue.trim() === '') {
        carImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect fill="%23e2e8f0" width="200" height="120"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">🚗 No Image</text></svg>';
        return;
    }
    
    // Map color names to image files
    const colorLower = colorValue.toLowerCase();
    let imageFile = 'white'; // default
    
    if (colorLower.includes('black')) imageFile = 'black';
    else if (colorLower.includes('white')) imageFile = 'white';
    else if (colorLower.includes('red')) imageFile = 'red';
    else if (colorLower.includes('blue')) imageFile = 'blue';
    else if (colorLower.includes('grey') || colorLower.includes('gray')) imageFile = 'gray';
    else if (colorLower.includes('silver') || colorLower.includes('titanium')) imageFile = 'titanium';
    else if (colorLower.includes('chrome')) imageFile = 'chrome';
    else if (colorLower.includes('iridium')) imageFile = 'iridium';
    
    const imageUrl = `Images/${imageFile}.webp`;
    carImage.src = imageUrl;
    carImage.alt = `${colorValue} Lexus`;
    
    // Handle image load error
    carImage.onerror = () => {
        carImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect fill="%23e2e8f0" width="200" height="120"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">🚗 Car Image</text></svg>';
    };
}

// Display Error Message
function displayError(plateNumber) {
    // Hide card, show error
    memberCard.style.display = 'none';
    errorMessage.style.display = 'flex';
    resultsContainer.style.display = 'block';
    
    // Set plate number in error
    errorPlate.textContent = plateNumber;
    
    // Scroll to results
    setTimeout(() => {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Show Loading Indicator
function showLoading() {
    loadingIndicator.style.display = 'block';
    resultsContainer.style.display = 'none';
    searchBtn.disabled = true;
    searchBtn.style.opacity = '0.6';
    searchBtn.style.cursor = 'not-allowed';
}

// Hide Loading Indicator
function hideLoading() {
    loadingIndicator.style.display = 'none';
    searchBtn.disabled = false;
    searchBtn.style.opacity = '1';
    searchBtn.style.cursor = 'pointer';
}

// Enter Edit Mode
function enterEditMode() {
    if (!currentMember) return;
    
    isEditMode = true;
    
    // Hide values, show inputs
    memberSince.style.display = 'none';
    memberName.style.display = 'none';
    memberColor.style.display = 'none';
    memberState.style.display = 'none';
    memberModel.style.display = 'none';
    
    inputMemberSince.style.display = 'block';
    inputMemberName.style.display = 'block';
    inputMemberColor.style.display = 'block';
    inputMemberState.style.display = 'block';
    inputMemberModel.style.display = 'block';
    
    // Set input values (empty if N/A)
    // Convert "Apr 18, 25" format to "2025-04-18" for date input
    const memberSinceValue = currentMember['Timestamp'] || '';
    if (memberSinceValue) {
        const dateObj = parseDateString(memberSinceValue);
        if (dateObj) {
            inputMemberSince.value = dateObj;
        } else {
            inputMemberSince.value = '';
        }
    } else {
        inputMemberSince.value = '';
    }
    
    inputMemberName.value = currentMember['Name'] || '';
    inputMemberColor.value = currentMember['Car Color'] || '';
    inputMemberState.value = currentMember['Location'] || '';
    inputMemberModel.value = currentMember['Model'] || '';
    
    // Show modification inputs (all 10 fields)
    displayModificationsEditMode(currentMember);
    
    const modsSection = document.querySelector('.modifications-section');
    if (modsSection) {
        modsSection.style.display = 'block';
    }
    
    // Toggle buttons
    editBtn.style.display = 'none';
    saveBtn.style.display = 'flex';
    cancelBtn.style.display = 'block';
    downloadBtn.style.display = 'none';
}

// Parse date string from "Apr 18, 25" to "2025-04-18"
function parseDateString(dateStr) {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return null;
    }
}

// Format date from "2025-04-18" to "Apr 18, 25"
function formatDateForSheet(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', year: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Exit Edit Mode
function exitEditMode() {
    isEditMode = false;
    
    // Show values, hide inputs
    memberSince.style.display = 'block';
    memberName.style.display = 'block';
    memberColor.style.display = 'block';
    memberState.style.display = 'block';
    memberModel.style.display = 'block';
    
    inputMemberSince.style.display = 'none';
    inputMemberName.style.display = 'none';
    inputMemberColor.style.display = 'none';
    inputMemberState.style.display = 'none';
    inputMemberModel.style.display = 'none';
    
    // Re-display modifications (only filled ones)
    displayModifications(currentMember);
    
    // Toggle buttons
    editBtn.style.display = 'flex';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    downloadBtn.style.display = 'flex';
}

// Cancel Edit
function cancelEdit() {
    exitEditMode();
}

// Save Changes
async function saveChanges() {
    if (!currentMember || currentRowIndex === -1) return;
    
    // Get updated values
    const updatedMemberSinceRaw = inputMemberSince.value.trim();
    const updatedMemberSince = updatedMemberSinceRaw ? formatDateForSheet(updatedMemberSinceRaw) : '';
    const updatedName = inputMemberName.value.trim();
    const updatedColor = inputMemberColor.value.trim();
    const updatedState = inputMemberState.value.trim();
    const updatedModel = inputMemberModel.value.trim();
    
    // Get modifications
    const modifications = {};
    for (let i = 1; i <= 10; i++) {
        modifications[`mod${i}`] = document.getElementById(`modInput${i}`).value.trim();
    }
    
    // Show loading
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Saving...</span>';
    
    try {
        // Send to Apps Script
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                row: currentRowIndex,
                timestamp: updatedMemberSince,
                name: updatedName,
                location: updatedState,
                plate: currentMember['License Plate'],
                color: updatedColor,
                model: updatedModel,
                ...modifications
            })
        });
        
        // Note: no-cors means we can't read response, but update should work
        // Update local data optimistically
        currentMember['Timestamp'] = updatedMemberSince;
        currentMember['Name'] = updatedName;
        currentMember['Location'] = updatedState;
        currentMember['Car Color'] = updatedColor;
        currentMember['Model'] = updatedModel;
        
        // Update modifications
        for (let i = 1; i <= 10; i++) {
            currentMember[`Mod${i}`] = modifications[`mod${i}`];
        }
        
        // Wait a bit for the sheet to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reload sheet data
        await loadSheetData();
        
        // Find the updated member by license plate
        const updatedMember = membersData.find(m => 
            m['License Plate'] && m['License Plate'].toUpperCase().replace(/\s+/g, '') === currentMember['License Plate'].toUpperCase().replace(/\s+/g, '')
        );
        
        if (updatedMember) {
            currentMember = updatedMember;
            currentRowIndex = updatedMember._rowIndex;
            displayMemberCard(updatedMember);
        }
        
        // Show success message
        alert('✅ Member information updated successfully!');
        
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('❌ Failed to save changes. Please try again.');
    } finally {
        // Reset button
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span class="btn-icon">💾</span><span class="btn-text">Save Changes</span>';
    }
}

// Download Card as PNG
async function downloadCard() {
    const cardElement = document.getElementById('cardToDownload');
    
    try {
        // Show downloading state
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generating Image...</span>';
        
        // Configure html2canvas options
        const canvas = await html2canvas(cardElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true
        });
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const plateNum = memberPlate.textContent.replace(/\s+/g, '_');
            link.download = `Lexus_Club_Member_${plateNum}.png`;
            link.href = url;
            link.click();
            
            // Cleanup
            URL.revokeObjectURL(url);
            
            // Reset button
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = '<span class="btn-icon">📥</span><span class="btn-text">Download Card as PNG</span>';
        });
        
    } catch (error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. Please try again.');
        
        // Reset button
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<span class="btn-icon">📥</span><span class="btn-text">Download Card as PNG</span>';
    }
}

// Display Modifications
function displayModifications(member) {
    const modsList = document.getElementById('modificationsList');
    const modsCount = document.getElementById('modsCount');
    
    if (!modsList || !modsCount) {
        return; // Elements not found, skip
    }
    
    modsList.innerHTML = '';
    
    // Collect filled modifications
    const filledMods = [];
    for (let i = 1; i <= 10; i++) {
        const modKey = `Mod${i}`;
        const modValue = member[modKey] || '';
        if (modValue.trim() !== '') {
            filledMods.push({ number: i, value: modValue });
        }
    }
    
    modsCount.textContent = `${filledMods.length}/10`;
    
    // Display stars (1 star per 2 modifications, half star for odd)
    const modStars = document.getElementById('modStars');
    if (modStars) {
        modStars.innerHTML = '';
        const fullStars = Math.floor(filledMods.length / 2);
        const hasHalfStar = filledMods.length % 2 === 1;
        
        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('span');
            star.className = 'mod-star';
            star.textContent = '⭐';
            modStars.appendChild(star);
        }
        
        if (hasHalfStar) {
            const halfStar = document.createElement('span');
            halfStar.className = 'mod-star';
            halfStar.textContent = '🌟';
            modStars.appendChild(halfStar);
        }
    }
    
    if (filledMods.length === 0) {
        // Show 'No modification' message
        const noModDiv = document.createElement('div');
        noModDiv.className = 'mod-display empty';
        noModDiv.textContent = 'No modification';
        modsList.appendChild(noModDiv);
    } else {
        // Show only filled modifications
        filledMods.forEach(mod => {
            const modItem = document.createElement('div');
            modItem.className = 'mod-item';
            
            const modNumber = document.createElement('span');
            modNumber.className = 'mod-number';
            modNumber.textContent = mod.number;
            
            const modDisplay = document.createElement('div');
            modDisplay.className = 'mod-display';
            modDisplay.textContent = mod.value;
            
            modItem.appendChild(modNumber);
            modItem.appendChild(modDisplay);
            modsList.appendChild(modItem);
        });
    }
}

// Display Modifications Edit Mode
function displayModificationsEditMode(member) {
    const modsList = document.getElementById('modificationsList');
    const modsCount = document.getElementById('modsCount');
    
    if (!modsList || !modsCount) {
        return;
    }
    
    modsList.innerHTML = '';
    
    let filledCount = 0;
    
    // Show all 10 input fields
    for (let i = 1; i <= 10; i++) {
        const modKey = `Mod${i}`;
        const modValue = member[modKey] || '';
        
        if (modValue.trim() !== '') {
            filledCount++;
        }
        
        const modItem = document.createElement('div');
        modItem.className = 'mod-item';
        
        const modNumber = document.createElement('span');
        modNumber.className = 'mod-number';
        modNumber.textContent = i;
        
        const modInput = document.createElement('input');
        modInput.type = 'text';
        modInput.className = 'mod-input';
        modInput.id = `modInput${i}`;
        modInput.value = modValue;
        modInput.placeholder = 'Enter modification...';
        
        modItem.appendChild(modNumber);
        modItem.appendChild(modInput);
        modsList.appendChild(modItem);
    }
    
    modsCount.textContent = `${filledCount}/10`;
    
    // Display stars in edit mode too
    const modStars = document.getElementById('modStars');
    if (modStars) {
        modStars.innerHTML = '';
        const fullStars = Math.floor(filledCount / 2);
        const hasHalfStar = filledCount % 2 === 1;
        
        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('span');
            star.className = 'mod-star';
            star.textContent = '⭐';
            modStars.appendChild(star);
        }
        
        if (hasHalfStar) {
            const halfStar = document.createElement('span');
            halfStar.className = 'mod-star';
            halfStar.textContent = '🌟';
            modStars.appendChild(halfStar);
        }
    }
}

// Display Tenure Stars
function displayTenureStars(timestampValue) {
    const tenureStarsContainer = document.getElementById('tenureStars');
    tenureStarsContainer.innerHTML = '';
    
    if (!timestampValue || timestampValue.trim() === '') {
        return;
    }
    
    try {
        const memberSinceDate = new Date(timestampValue);
        const today = new Date();
        
        // Calculate difference in months
        const monthsDiff = (today.getFullYear() - memberSinceDate.getFullYear()) * 12 + 
                          (today.getMonth() - memberSinceDate.getMonth());
        
        // Calculate number of stars (1 star per 6 months)
        const numStars = Math.floor(monthsDiff / 6);
        
        // Add trophies to container
        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('span');
            star.className = 'tenure-star';
            star.textContent = '🏆';
            star.style.setProperty('--star-index', i);
            tenureStarsContainer.appendChild(star);
        }
        
        // Add tenure text if there are stars
        if (numStars > 0) {
            const tenureText = document.createElement('span');
            tenureText.style.fontSize = '13px';
            tenureText.style.color = 'var(--muted)';
            tenureText.style.fontWeight = '500';
            tenureText.style.marginLeft = '8px';
            const years = Math.floor(numStars / 2);
            if (years > 0) {
                tenureText.textContent = `${years} year${years > 1 ? 's' : ''} of membership`;
            } else {
                tenureText.textContent = `${numStars * 6} months of membership`;
            }
            tenureStarsContainer.appendChild(tenureText);
        }
    } catch (error) {
        console.error('Error calculating tenure:', error);
    }
}

// Utility: Capitalize Words
function capitalizeWords(str) {
    return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

// Load AI Insights
async function loadInsights() {
    const insightsSection = document.getElementById('insightsSection');
    const insightsLoading = document.getElementById('insightsLoading');
    const insightsContent = document.getElementById('insightsContent');
    
    if (!insightsSection || !insightsLoading || !insightsContent) return;
    
    // Show section and loading state
    insightsSection.style.display = 'block';
    insightsLoading.style.display = 'flex';
    insightsContent.innerHTML = '';
    
    try {
        // Check if Apps Script URL is configured
        if (APPS_SCRIPT_INSIGHTS_URL === 'YOUR_APPS_SCRIPT_INSIGHTS_URL_HERE') {
            // Use mock data for local testing
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
            displayMockInsights();
            return;
        }
        
        // Fetch insights from Apps Script
        const response = await fetch(`${APPS_SCRIPT_INSIGHTS_URL}?action=getInsights`);
        const data = await response.json();
        
        if (data.success && data.insights) {
            displayInsights(data.insights, data.metrics);
        } else {
            throw new Error('Failed to load insights');
        }
    } catch (error) {
        console.error('Error loading insights:', error);
        insightsContent.innerHTML = `
            <p style="color: var(--muted); font-style: italic;">
                ⚠️ Unable to load AI insights at this time. Please try again later.
            </p>
        `;
    } finally {
        insightsLoading.style.display = 'none';
    }
}

// Display Insights
function displayInsights(insightsText, metrics) {
    const insightsContent = document.getElementById('insightsContent');
    
    let html = `<p>${insightsText}</p>`;
    
    if (metrics) {
        html += '<div class="insights-metrics">';
        
        if (metrics.newMembers !== undefined) {
            html += `
                <div class="insight-metric">
                    <div class="metric-label">New Members (3 months)</div>
                    <div class="metric-value">${metrics.newMembers}</div>
                </div>
            `;
        }
        
        if (metrics.topState) {
            html += `
                <div class="insight-metric">
                    <div class="metric-label">Most Popular State</div>
                    <div class="metric-value">${metrics.topState}</div>
                </div>
            `;
        }
        
        if (metrics.favoriteColor) {
            html += `
                <div class="insight-metric">
                    <div class="metric-label">Favorite Color (3 months)</div>
                    <div class="metric-value">${metrics.favoriteColor}</div>
                </div>
            `;
        }
        
        if (metrics.totalEdits !== undefined) {
            html += `
                <div class="insight-metric">
                    <div class="metric-label">Recent Edits</div>
                    <div class="metric-value">${metrics.totalEdits}</div>
                </div>
            `;
        }
        
        html += '</div>';
    }
    
    insightsContent.innerHTML = html;
}

// Display Mock Insights (for local testing)
function displayMockInsights() {
    // Calculate actual metrics from loaded data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Count new members in last 3 months
    const newMembers = membersData.filter(m => {
        const memberDate = new Date(m['Timestamp']);
        return memberDate >= threeMonthsAgo;
    }).length;
    
    // Find most common state
    const stateCounts = {};
    membersData.forEach(m => {
        const state = m['Location'] || 'Unknown';
        if (state.trim() !== '') {
            stateCounts[state] = (stateCounts[state] || 0) + 1;
        }
    });
    const topState = Object.entries(stateCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Find favorite color in last 3 months
    const recentColorCounts = {};
    membersData.filter(m => {
        const memberDate = new Date(m['Timestamp']);
        return memberDate >= threeMonthsAgo;
    }).forEach(m => {
        const color = m['Car Color'] || 'Unknown';
        if (color.trim() !== '') {
            recentColorCounts[color] = (recentColorCounts[color] || 0) + 1;
        }
    });
    const favoriteColor = Object.entries(recentColorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Count members with modifications (proxy for edits)
    const totalEdits = membersData.filter(m => {
        for (let i = 1; i <= 10; i++) {
            if (m[`Mod${i}`] && m[`Mod${i}`].trim() !== '') {
                return true;
            }
        }
        return false;
    }).length;
    
    const metrics = {
        newMembers,
        topState,
        favoriteColor,
        totalEdits
    };
    
    // Generate mock AI summary
    const insightsText = `The Lexus 4IS Club Malaysia community continues to grow with ${newMembers} new members joining in the past three months. ${topState} leads in membership, reflecting strong regional enthusiasm. ${favoriteColor} has emerged as the most popular car color choice among recent members, while ${totalEdits} members have actively personalized their profiles with modification details, showcasing the community's passion for customization.`;
    
    displayInsights(insightsText, metrics);
}

// --- DOM Elements ---
const form = document.getElementById('numerology-form');
const resultsContainer = document.getElementById('results-container');
const resultsPlaceholder = document.getElementById('results-placeholder');
const resultsContent = document.getElementById('results-content');
const loadingSpinner = document.getElementById('loading-spinner');
const errorEl = document.getElementById('form-error');

const displayFullName = document.getElementById('display-full-name');
const displayDob = document.getElementById('display-dob');
const displayCurrentDate = document.getElementById('display-current-date');
const basicDetailsHeader = document.getElementById('basic-details-header');

// --- ALL DATA AND CALCULATION LOGIC HAS BEEN REMOVED ---
//
// The following variables have been DELETED from this file and
// will be moved to your Python 'app.py' backend:
//
// - friendNumbers
// - planetaryRulers
// - interpretations
// - zodiacSymbols
// - numberInterpretations
// - compatibilityDescriptions
// - letterValues
//
// The following functions have been DELETED from this file and
// will be ported to your Python 'app.py' backend:
//
// - reduceToSingleDigit()
// - forceSingleDigit()
// - calculateNameNumber()
// - getZodiacSign()
// - calculateNumerology()
//
// --- END OF REMOVED LOGIC ---


// --- Date Formatting Helper Functions (Kept for Display) ---
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}
function formatDateWithOrdinal(date) {
    // Use UTC functions to avoid timezone issues
    const day = date.getUTCDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const year = date.getUTCFullYear();
    return `${day}${suffix}, ${month} ${year}`;
}

// --- MODIFIED Event Listener ---
form.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    errorEl.classList.add('hidden');
    resultsContent.classList.add('hidden');
    resultsPlaceholder.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    basicDetailsHeader.classList.add('opacity-0');

    // --- NEW: Get form data as an object to send ---
    const formData = new FormData(form);
    const dataToSend = {
        firstName: formData.get('firstName'),
        middleName: formData.get('middleName'),
        lastName: formData.get('lastName'),
        dob: formData.get('dob'),
        gender: formData.get('gender'),
        mobile: formData.get('mobile')
    };

    // --- Validation (Kept on Frontend) ---
    if (!dataToSend.firstName || !dataToSend.lastName || !dataToSend.dob || !dataToSend.gender) {
        errorEl.textContent = "Please fill in all required fields: First Name, Last Name, Gender, and Date of Birth.";
        errorEl.classList.remove('hidden');
        resultsPlaceholder.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
        return; 
    }
    
    try {
        // --- NEW: API Call to Python Backend ---
        //
        // IMPORTANT: Replace this URL with your
        // actual PythonAnywhere web app URL.
        // Use http:// for the free tier.
        //
        const apiUrl = 'http://keshvaggrawal.pythonanywhere.com/api/calculate';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        // The 'report' object now comes from your Python server
        const report = await response.json();
        // --- END OF NEW API CALL ---
        
        // Display user details (using the data we just sent)
        const fullDisplayName = [dataToSend.firstName, dataToSend.middleName, dataToSend.lastName]
            .filter(Boolean).map(name => name.toUpperCase()).join(' ');
        
        const dateParts = dataToSend.dob.split('-').map(Number);
        const dateObj = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
        const formattedDob = formatDateWithOrdinal(dateObj);
        const formattedCurrentDate = formatDateWithOrdinal(new Date()); 

        displayFullName.textContent = fullDisplayName;
        displayDob.textContent = formattedDob;
        displayCurrentDate.textContent = formattedCurrentDate;
        basicDetailsHeader.classList.remove('opacity-0'); 

        // Display the results (this function is unchanged)
        displayResults(report);
        resultsContent.classList.remove('hidden');

    } catch (error) {
        console.error('Error during fetch:', error);
        errorEl.textContent = `An error occurred: ${error.message}. Please check the API URL and server logs.`;
        errorEl.classList.remove('hidden');
        resultsPlaceholder.classList.remove('hidden'); 
        basicDetailsHeader.classList.add('opacity-0'); 
    } finally {
        loadingSpinner.classList.add('hidden'); 
    }
});


// --- Display Logic (All functions below are kept for the frontend) ---
function createResultCard(title, number, interpretation, delay, footerText = '', ruler = null) {
    const interp = interpretation || { title: "Cosmic Insight", text: "This value represents a key aspect of your life's blueprint." };
    const isHarmonyTitle = title === 'Core Number Harmony' && typeof number === 'string' && number.includes('-');
    // Check if 'number' is a string that doesn't parse to a float, or if it's the harmony title
    const isText = (typeof number === 'string' && isNaN(parseFloat(number))) || isHarmonyTitle; 
    
    let numberDisplayClass = ''; 
    if (title === 'Mobile Number Analysis') {
        numberDisplayClass = 'text-3xl md:text-4xl';
    } else if (isText) {
        // For text like Zodiac Symbols or "Yes/No", make them large
        numberDisplayClass = 'text-5xl md:text-6xl';
    } else {
        numberDisplayClass = 'text-5xl md:text-6xl';
    }
    
    let extraStyles = '';
    if (isText) {
        extraStyles = 'style="white-space: nowrap;"';
    }

    const footerHTML = footerText ? `<div class="mt-4 pt-3 border-t border-gray-700 text-sm text-purple-200/80"><strong class="text-purple-300">${footerText.startsWith("Total:") ? "" : "Friend Numbers: "}</strong> ${footerText}</div>` : '';
    let displayValue = number;
    const rulerHTML = ruler ? `<p class="ruler-text mt-1">Ruler: ${ruler.name} (${ruler.keyword})</p>` : '';
    let cardTitle = title;
    
    // Check for compatibilityData structure
    if (title === 'Core Number Harmony' && interpretation?.type && interpretation.type !== 'N/A') {
         cardTitle += ` (${interpretation.type})`; 
    }
    
    let interpText = interp.text;
    if (title === 'Mobile Number Analysis') {
        interpText = interpretation.text;
        // Make warnings stand out
        interpText = interpText.replace(/\*\*not compatible\*\*/g, '<strong class="text-red-400">not compatible</strong>');
        interpText = interpText.replace(/\*\*not\*\*/g, '<strong class="text-yellow-400">not</strong>');
    }

    return `
        <div class="result-card p-6" style="animation-delay: ${delay}ms;">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-purple-300">${cardTitle}</p> 
                    ${rulerHTML}
                    <h3 class="font-serif text-2xl text-white mt-1">${interp.title}</h3>
                </div>
                <div class="number-display ${numberDisplayClass} font-bold" ${extraStyles}>${displayValue}</div> 
            </div>
            <p class="text-gray-400 mt-4">${interpText}</p>
            ${footerHTML}
        </div>`;
}

function createLoShuGrid(title, counts, delay, explanationText = '') {
     const gridLayout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
     let tableRows = '';
     gridLayout.forEach(row => {
         let tableCells = '';
         row.forEach(num => {
             const count = counts[num] || 0;
             const displayVal = count > 0 ? String(num).repeat(count) : '&nbsp;';
             const cellClass = count > 0 ? 'loshu-cell has-number' : 'loshu-cell';
             tableCells += `<td class="${cellClass} h-16 w-16 text-center text-xl align-middle p-1">${displayVal}</td>`;
         });
         tableRows += `<tr>${tableCells}</tr>`;
     });
     const explanationHTML = explanationText ? `<p class="text-center text-sm text-gray-400 mb-4">${explanationText}</p>` : '';
     return `
         <div class="result-card p-6" style="animation-delay: ${delay}ms;">
             <h3 class="font-serif text-2xl text-white mb-2 text-center">${title}</h3>
             ${explanationHTML}
             <table class="w-full border-collapse bg-gray-900/50"><tbody>${tableRows}</tbody></table>
         </div>`;
}

function createNamePartsCard(report, delay) { 
    // Ensure report properties exist before trying to access them
    const parts = [
         { label: 'First Name', number: report.firstNameNumber || 0, total: report.firstNameTotal || 0 },
         ...(report.middleNameTotal > 0 ? [{ label: 'Middle Name', number: report.middleNameNumber || 0, total: report.middleNameTotal || 0 }] : []),
         { label: 'Last Name', number: report.lastNameNumber || 0, total: report.lastNameTotal || 0 }
     ];
     let contentHTML = parts.map(part => `
         <div class="flex-1 text-center px-2">
             <p class="text-purple-300 text-sm">${part.label}</p>
             <p class="number-display text-5xl font-bold">${part.number}</p>
             <p class="text-gray-400 text-xs mt-1">Total: ${part.total}</p>
         </div>
     `).join('<div class="border-l border-gray-700 mx-2"></div>');
     return `
         <div class="result-card p-6" style="animation-delay: ${delay}ms;">
             <h3 class="font-serif text-2xl text-white mb-4 text-center">Name Component Numbers</h3>
             <div class="flex justify-around items-center">
                 ${contentHTML}
             </div>
         </div>`;
}

// --- Main Display Function (Receives 'report' from API) ---
function displayResults(report) {
    // These objects are now sent from the Python server,
    // so we just need to pass them along.
    // We create fallback objects just in case.
    const numberInterps = report.numberInterpretations || {};
    const zodiacInterps = report.interpretations?.zodiac || {};
    const zodiacSyms = report.zodiacSymbols || {};

    const harmonyDisplay = `${report.baseDriver}-${report.baseConductor}`;
    const gridExplanation = `Includes Moolank (${report.baseDriver}), Bhagyank (${report.baseConductor}), Kua No. (${report.kuaNumber}), & Name No. (${report.fullNameNumber}).`;
    
    const correctionInterpretation = {
        title: report.nameCorrectionRequired === "Yes" ? "Correction Recommended" : "Harmonious Name",
        text: report.correctionReason 
    };
    
    let mobileCardHTML = '';
    if (report.mobileAnalysis !== 'No mobile number provided for analysis.') {
        const mobileInterp = {
            title: "Mobile Compatibility",
            text: report.mobileAnalysis 
        };
        // We give it a 0ms delay here and update it when we inject it later
        mobileCardHTML = createResultCard('Mobile Number Analysis', report.mobileNumber, mobileInterp, 0); 
    }

    const zodiacSymbol = zodiacSyms[report.zodiacSign] || '?';
    const zodiacInterp = zodiacInterps[report.zodiacSign] || { title: report.zodiacSign || "Unknown", text: "Basic astrological influence based on Sun's position." };

    let delay = 100; 
    const delayIncrement = 100; 
    const createSectionHeader = (title) => {
        const header = `<h2 class="font-serif text-3xl text-white mb-4 mt-8 border-b border-purple-500/30 pb-2 result-card" style="animation-delay: ${delay}ms;">${title}</h2>`;
        delay += delayIncrement; 
        return header;
    };
    
    // Clear previous results
    resultsContent.innerHTML = '';
    
    // Prepend the header (which is already in the HTML)
    resultsContent.appendChild(basicDetailsHeader);
    basicDetailsHeader.classList.remove('opacity-0'); 

    // --- Build Sections ---
    const header1 = createSectionHeader("Core Numbers");
    const section1 = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${createResultCard('Driver Number (Moolank)', report.driverNumber, numberInterps[report.driverNumber] || null, delay, report.driverLuckyNumbers, report.driverRuler)}
            ${createResultCard('Conductor Number (Bhagyank)', report.conductorNumber, numberInterps[report.conductorNumber] || null, delay += delayIncrement, report.conductorLuckyNumbers, report.conductorRuler)} 
        </div>
        <div class="mt-6">
            ${createResultCard('Core Number Harmony', harmonyDisplay, report.compatibilityData, delay += delayIncrement)} 
        </div>`;

    const header2 = createSectionHeader("Name Analysis");
    const section2 = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            ${createResultCard('Total Name Number (Expression)', report.fullNameNumber, numberInterps[report.fullNameNumber] || null, delay += delayIncrement, `Total: ${report.fullNameTotal}`)}
            ${createResultCard('Soul Urge Number', report.soulUrgeNumber, numberInterps[report.soulUrgeNumber] || null, delay += delayIncrement)}
            ${createResultCard('Personality Number', report.personalityNumber, numberInterps[report.personalityNumber] || null, delay += delayIncrement)}
        </div>
        ${createNamePartsCard(report, delay += delayIncrement)}
        <div class="mt-6">
            ${createResultCard('Name Correction Required', report.nameCorrectionRequired, correctionInterpretation, delay += delayIncrement)}
        </div>`;

    const header3 = createSectionHeader("Influences & Indicators");
    const section3 = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            ${createResultCard('Zodiac Sign', zodiacSymbol, zodiacInterp, delay += delayIncrement)} 
            ${createResultCard('Kua Number', report.kuaNumber, numberInterps[report.kuaNumber] || null, delay += delayIncrement)}
            ${createResultCard('Success Number', report.successNumber, {title: "Achievement Key", text:"A number that aids in achieving your life's goals and ambitions.", ...(numberInterps[report.successNumber] || {})}, delay += delayIncrement)}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${createResultCard('Karmic Debt', report.karmicDebt, {title: "Indicator", text:"Reflects lessons from past actions that need to be addressed in this lifetime."}, delay += delayIncrement)}
            ${createResultCard('Master Number', report.masterNumber, {title: "Indicator", text:"Signifies a higher potential for achievement and spiritual purpose, but with greater challenges (11, 22, or 33)."}, delay += delayIncrement)}
        </div>`;

    const header4 = createSectionHeader("Your Current Year");
    const section4 = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${createResultCard('Personal Year', report.personalYear, {title: "Current Vibe", text:"The theme for your current year from one birthday to the next.", ...(numberInterps[report.personalYear] || {})}, delay += delayIncrement)}
            ${createResultCard('Universal Year', report.universalYear, {title: "Global Vibe", text:"The collective energy influencing everyone on the planet this year.", ...(numberInterps[report.universalYear] || {})}, delay += delayIncrement)}
        </div>`;

    const header5 = createSectionHeader("Charts & Extras");
    const section5 = `
        <div class="grid grid-cols-1 gap-6 mb-6">
            ${createLoShuGrid('Lo Shu Grid (Date of Birth)', report.baseGridCounts, delay += delayIncrement)}
            ${createLoShuGrid('Lo Shu Grid (Full Chart)', report.fullGridCounts, delay += delayIncrement, gridExplanation)}
        </div>
        ${mobileCardHTML ? `<div class="mt-6">${mobileCardHTML.replace(`style="animation-delay: 0ms;"`, `style="animation-delay: ${delay += delayIncrement}ms;"`)}</div>` : ''}
    `;
    
    // Inject all sections into the page
    resultsContent.insertAdjacentHTML('beforeend', 
        header1 + section1 + 
        header2 + section2 + 
        header3 + section3 + 
        header4 + section4 + 
        header5 + section5);
}

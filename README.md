# AHP - Analytic Hierarchy Process Tool

A lightweight, single-page web application for conducting Analytic Hierarchy Process (AHP) analysis through pairwise comparisons. Make better decisions by systematically comparing options and calculating their relative priorities.

## What is AHP?

The Analytic Hierarchy Process is a structured decision-making methodology developed by Thomas Saaty. It helps you:

- **Break down complex decisions** into simple pairwise comparisons
- **Calculate objective priorities** from subjective judgments
- **Measure consistency** of your preferences
- **Make data-driven decisions** when choosing between multiple options

Learn more: [Wikipedia - Analytic Hierarchy Process](https://en.wikipedia.org/wiki/Analytic_hierarchy_process)

## Features

### Core Functionality
- **Simple pairwise comparisons** - Compare two options at a time instead of ranking all at once
- **Automatic calculations** - Mathematical AHP algorithm calculates relative weights
- **Consistency checking** - Validates logical consistency of your comparisons (CR < 0.11 is good)
- **Visual results** - Bar charts and percentage values show relative priorities

### User Experience
- **Input validation** - Prevents invalid polls (duplicate options, missing data)
- **Auto-save** - Poll state and results persist across page refreshes
- **Delete results** - Remove unwanted result sets with confirmation
- **Retry polls** - Re-run comparisons with same options
- **Always visible results** - Saved results displayed below setup section

### Technical Features
- **No backend required** - Pure client-side JavaScript application
- **localStorage persistence** - All data saved locally in your browser
- **No dependencies** - Vanilla JavaScript (jQuery removed)
- **Responsive validation** - Real-time error messages with auto-dismiss

## How to Use

### Step 1: Set Up Your Poll

1. **Enter a question** that supports pairwise comparison
   - Good: "Which feature is more important for our product?"
   - Bad: "What features should we build?" (not comparative)

2. **Add your options** (minimum 2 required)
   - Enter each option on a separate line in the textarea
   - Click "Add +" to add them to the list
   - Duplicates are automatically detected and rejected

### Step 2: Start the Poll

1. Click **"Start"** to begin pairwise comparisons
2. The app will present all possible pairs of options
3. For each pair, choose which option is more important:
   - **<< Much More** - Left option is significantly more important (4x weight)
   - **< Slightly More** - Left option is somewhat more important (2x weight)
   - **Same** - Both options are equally important (1x weight)
   - **Slightly More >** - Right option is somewhat more important (2x weight)
   - **Much More >>** - Right option is significantly more important (4x weight)

### Step 3: Review Results

After completing all comparisons, you'll see:

- **Ranked options** with calculated priority percentages
- **Visual bar chart** showing relative weights
- **Consistency Ratio (CR)** - Lower is better:
  - CR < 0.10 (Green) - Excellent consistency ✓
  - CR 0.10-0.11 (Orange) - Acceptable consistency
  - CR > 0.11 - Inconsistent judgments, consider retrying

### Step 4: Take Action

- **Retry** - Re-run the same poll with fresh comparisons
- **Delete** - Remove this result set permanently
- **Hide/Show** - Toggle visibility of detailed results
- **Scale** - Align multiple polls by normalizing results through a shared reference option

## Usage Example

### Scenario: Prioritizing Product Features

You're a product manager deciding which features to build first.

**Question:** "Which feature provides more value to users?"

**Options:**
```
Dark mode support
Offline functionality
Real-time collaboration
Export to PDF
```

**Sample Comparisons:**

1. **Dark mode** vs **Offline** → Offline slightly more (user says: "< Slightly More")
2. **Dark mode** vs **Real-time** → Real-time much more (user says: "Much More >>")
3. **Dark mode** vs **Export PDF** → Dark mode slightly more (user says: "Slightly More >")
4. **Offline** vs **Real-time** → Real-time slightly more (user says: "Slightly More >")
5. **Offline** vs **Export PDF** → Offline much more (user says: "<< Much More")
6. **Real-time** vs **Export PDF** → Real-time much more (user says: "Much More >>")

**Results:**

```
Result Set #1: Which feature provides more value to users?

Option                      Result    Scaled Result
─────────────────────────────────────────────────────
Real-time collaboration     0.4821    48.21%  ████████████████████████████
Offline functionality       0.2947    29.47%  ████████████████
Dark mode support          0.1526    15.26%  ████████
Export to PDF              0.0706     7.06%  ███

Consistency Ratio: 0.0234 ✓ (Green - Excellent!)
```

**Interpretation:**
- Build **Real-time collaboration** first (48% priority)
- Then **Offline functionality** (29% priority)
- **Dark mode** and **Export PDF** are lower priorities

## Number of Comparisons

The app requires `n × (n - 1) / 2` comparisons for `n` options:

- 2 options = 1 comparison
- 3 options = 3 comparisons
- 4 options = 6 comparisons
- 5 options = 10 comparisons
- 6 options = 15 comparisons
- 7 options = 21 comparisons
- 10 options = 45 comparisons

💡 **Tip:** Polls work best with **7 or fewer options**. For larger lists, use multiple polls and the Scale feature to combine results.

## Scaling Multiple Polls (For Large Option Lists)

When you have more than 7 options to compare, break them into multiple smaller polls and use the **Scale** feature to combine the results.

### How It Works

1. **Divide your options** into groups of 7 or fewer
2. **Include one shared "bridge" option** from the first poll in the second poll
3. **Complete both polls** separately
4. **Use the Scale feature** to normalize the second poll so the shared option has approximately the same value as in the first poll
5. **Repeat** for additional polls if needed

### Example: Prioritizing 12 Features

**Too many options:** Comparing 12 features requires 66 comparisons and becomes inconsistent.

**Better approach:**

**Poll 1:** Compare Features A-G (7 options = 21 comparisons)
```
Results:
Feature A: 0.2500
Feature B: 0.1800
Feature C: 0.1500  ← Bridge option
Feature D: 0.1400
Feature E: 0.1200
Feature F: 0.1100
Feature G: 0.0500
```

**Poll 2:** Compare Features C, H-L (6 options = 15 comparisons, C is the bridge)
```
Results (before scaling):
Feature C: 0.3000  ← Bridge option (was 0.1500 in Poll 1)
Feature H: 0.2500
Feature I: 0.2000
Feature J: 0.1500
Feature K: 0.0700
Feature L: 0.0300
```

**Scaling Poll 2:**
- Bridge option C should be 0.1500 (from Poll 1) but is currently 0.3000
- Scale factor = 0.1500 / 0.3000 = 0.5
- Enter "0.5" in the Scale input and click Scale

**Poll 2 Results (after scaling):**
```
Feature C: 0.1500  ← Now matches Poll 1
Feature H: 0.1250
Feature I: 0.1000
Feature J: 0.0750
Feature K: 0.0350
Feature L: 0.0150
```

**Combined Final Results:**
```
Feature A: 0.2500  (from Poll 1)
Feature B: 0.1800  (from Poll 1)
Feature C: 0.1500  (from Poll 1)
Feature D: 0.1400  (from Poll 1)
Feature H: 0.1250  (from Poll 2, scaled)
Feature E: 0.1200  (from Poll 1)
Feature F: 0.1100  (from Poll 1)
Feature I: 0.1000  (from Poll 2, scaled)
Feature J: 0.0750  (from Poll 2, scaled)
Feature G: 0.0500  (from Poll 1)
Feature K: 0.0350  (from Poll 2, scaled)
Feature L: 0.0150  (from Poll 2, scaled)
```

### Tips for Scaling

- Choose a **middle-ranked option** as your bridge (not the highest or lowest priority)
- The bridge option should be comparable to items in both polls
- You can chain multiple polls together using different bridge options
- After scaling, the results are directly comparable across all polls

## Data Storage

All data is stored in your browser's localStorage:

- **Poll state** (`ahp_poll_state`) - Current question, options, and voting progress
- **Poll results** (`ahp_poll_results`) - All completed result sets

### What Gets Saved
- Question text and options (auto-saved as you type)
- Active poll progress (survives page refresh)
- All completed result sets with timestamps
- Result numbering sequence

### What Doesn't Get Saved
- Data is browser-specific (not synced across devices)
- Clearing browser data will delete all polls
- No cloud backup or export (yet)

## Browser Compatibility

Works in all modern browsers that support:
- ES5 JavaScript
- localStorage API
- CSS3

Tested on: Chrome, Firefox, Safari, Edge

## Installation

No installation required! Just open `index.html` in a web browser.

### Running Locally

1. Clone or download this repository
2. Open `index.html` in your browser
3. Start creating polls!

### Hosting

Upload all files to any web server:
```bash
.
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── ahpCalc.obj.js
│   └── site.js
└── img/
    ├── 1-10.png
    └── simple.png
```

No server-side processing required - purely static HTML/CSS/JS.

## Technical Details

### Architecture
- **ahpCalc.obj.js** - Core AHP mathematics (matrix normalization, eigenvalues)
- **site.js** - UI controller, event handling, localStorage management
- **Vanilla JavaScript** - No framework dependencies
- **localStorage** - Client-side persistence

### AHP Calculation Method
1. Builds pairwise comparison matrix from user votes
2. Normalizes matrix columns
3. Calculates average of normalized rows (priority vector)
4. Computes consistency ratio using eigenvalues
5. Returns ranked results with consistency metric

### Validation Rules
- Question text cannot be empty
- Minimum 2 options required
- No duplicate options allowed (case-insensitive)
- Empty/whitespace-only options ignored

## Use Cases

- **Product Management** - Prioritize features or requirements
- **Project Planning** - Choose between project alternatives
- **Resource Allocation** - Decide budget distribution
- **Vendor Selection** - Evaluate and rank suppliers
- **Strategic Planning** - Compare strategic initiatives
- **Team Decisions** - Facilitate group consensus building

## Tips for Best Results

1. **Keep comparisons focused** - One criterion per poll (e.g., "importance" OR "urgency", not both)
2. **Be consistent** - If A > B and B > C, then A should > C
3. **Watch the CR** - Green consistency ratio means your judgments are logical
4. **Use retry wisely** - If CR is orange/red, your comparisons may be inconsistent
5. **Document context** - Note why you made certain comparisons for future reference

## Limitations

- **No collaboration** - Single-user tool (no multi-user voting)
- **No export** - Results can't be exported to CSV/Excel
- **No weights customization** - Uses fixed scale (1, 2, 4 for simple voting)
- **Browser-bound data** - No cloud sync or backup

## Contributing

This is a simple, focused tool. Potential enhancements:

- [ ] CSV/JSON export functionality
- [ ] Detailed voting mode (1-10 scale) re-enablement
- [ ] Multi-criteria AHP support
- [ ] Group voting with consensus calculation
- [ ] Mobile-responsive design
- [ ] Dark mode UI

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software for any purpose, including commercial use.

## Credits

Based on the Analytic Hierarchy Process methodology by Thomas L. Saaty.

---

**Ready to make better decisions? Open `index.html` and start comparing!**

// Devanagari Dravida Virtual Keyboard Logic

// Define independent vowels and their matra forms (move to top for correct event handler setup)
const vowelKeys = ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ'];
const vowelMatras = ['्','ा','ि','ी','ु','ॖ','ू','ृ','ॢ'];
const vowelRow2 = ['ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ'];
const vowelMatras2 = ['ॆ','े','ॊ','ो','ै','ॅ','ौ'];

let mapping = {};
fetch('mapping.json')
  .then(response => response.json())
  .then(json => mapping = json);

const inputText = document.getElementById('inputText');
const vkDevanagari = document.getElementById('vk-devanagari');
const vkTamil = document.getElementById('vk-tamil');
const vkLabel = document.getElementById('vk-label');
const showDevaBtn = document.getElementById('showDeva');
const showTamilBtn = document.getElementById('showTamil');
const hideVKBtn = document.getElementById('hideVK');

function transliterate(text) {
  let result = text;
  for (const [key, value] of Object.entries(mapping)) {
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

inputText.addEventListener('input', function() {
  previewText.textContent = transliterate(inputText.value);
});

// Virtual Keyboard - Devanagari (custom layout)
const devanagariRows = [
  ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ','ऽ'],
  ['ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ','ं','ः','ஃ'],
  ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ'],
  ['ट','ठ','ड','ढ','ण','त़','श़','द़','ऱ','ऩ'],
  ['त','थ','द','ध','न','प','फ','ब','भ','म'],
  ['य','र','ल','व','श','ष','स','ह','ऴ','ळ'],
  [',', '।', '॥', ' ', '<', '↵']
];
// Keyboard layout constants
const KEY_UNIT = 2.8; // em
const GAP_UNIT = 0.3; // em
const ROW_UNITS = (10 * KEY_UNIT + 9 * GAP_UNIT) / KEY_UNIT + 1; // 15 key units per row
const LAST_ROW_LAYOUT = [1, 1, 1, 4, 1.5, 1.5]; // 5 singles, space(5), backspace(2), enter(2), comma(1)

const ROW_WIDTH = 10 * 2.8 + 5 * 2.8; // 10 normal + spacebar (5 wide) + 2 backspace/enter (2 wide each) = 15 keys wide
vkDevanagari.innerHTML = '';

devanagariRows.forEach((row, idx) => {
  const rowDiv = document.createElement('div');
  rowDiv.style.display = 'flex';
  rowDiv.style.justifyContent = 'center';
  rowDiv.style.gap = GAP_UNIT + 'em';
  rowDiv.style.margin = '0 auto';

  // Calculate total width units for the row
  let keyWidths = [];
  if (idx === devanagariRows.length - 1) {
    // Last row: [',', '।', '॥', ' ', '<', '↵']
    keyWidths = [1, 1, 1, 4, 1.5, 1.5];
  } else {
    keyWidths = Array(row.length).fill(1);
  }
  const totalUnits = keyWidths.reduce((a, b) => a + b, 0);
  rowDiv.style.width = `calc(${totalUnits} * ${KEY_UNIT}em + ${(row.length - 1)} * ${GAP_UNIT}em + 3em)`;

  row.forEach((key, i) => {
    const btn = document.createElement('button');
    btn.className = 'vk-btn dn-dravida';
    btn.style.fontFamily = 'dn-dravida, serif';
    let widthUnits = keyWidths[i] || 1;
    btn.style.flex = `0 0 ${widthUnits * KEY_UNIT + (widthUnits - 1) * GAP_UNIT}em`;
    btn.style.width = `${widthUnits * KEY_UNIT + (widthUnits - 1) * GAP_UNIT}em`;

    if (idx === 0 && i < vowelKeys.length) {
      // First row vowels
      btn.onclick = () => {
        const pos = getCursorPos(inputText);
        const val = inputText.value;
        const prev = pos > 0 ? val[pos-1] : '';
        const useMatra = isConsonant(prev);
        handleDevanagariKeyInput(key, i, useMatra, false);
      };
    } else if (idx === 1 && i < vowelRow2.length) {
      // Second row vowels
      btn.onclick = () => {
        const pos = getCursorPos(inputText);
        const val = inputText.value;
        const prev = pos > 0 ? val[pos-1] : '';
        const useMatra = isConsonant(prev);
        handleDevanagariKeyInput(key, i, useMatra, true);
      };
    } else if (idx === devanagariRows.length - 1) {
      // Last row: assign special labels
      btn.textContent = key === ' ' ? '␣' : key === '<' ? '⌫' : key === '↵' ? '↵' : key;
      btn.title = key === ' ' ? 'Space' : key === '<' ? 'Backspace' : key === '↵' ? 'Enter' : '';
      btn.onclick = () => {
        window._vk_updating = true;
        if (key === '<') {
          // Backspace at cursor position, handle nukta
          const start = inputText.selectionStart;
          const end = inputText.selectionEnd;
          let val = inputText.value;
          if (start > 0) {
            // If previous char is nukta, remove nukta and preceding char
            if (val[start - 1] === '़' && start > 1) {
              inputText.value = val.slice(0, start - 2) + val.slice(end);
              inputText.selectionStart = inputText.selectionEnd = start - 2;
            } else {
              inputText.value = val.slice(0, start - 1) + val.slice(end);
              inputText.selectionStart = inputText.selectionEnd = start - 1;
            }
          }
        } else if (key === '↵') {
          // Insert newline at cursor
          const start = inputText.selectionStart;
          const end = inputText.selectionEnd;
          let val = inputText.value;
          inputText.value = val.slice(0, start) + '\n' + val.slice(end);
          inputText.selectionStart = inputText.selectionEnd = start + 1;
        } else if (key === ' ') {
          // Insert space at cursor
          const start = inputText.selectionStart;
          const end = inputText.selectionEnd;
          let val = inputText.value;
          inputText.value = val.slice(0, start) + ' ' + val.slice(end);
          inputText.selectionStart = inputText.selectionEnd = start + 1;
        } else {
          // Insert key at cursor
          const start = inputText.selectionStart;
          const end = inputText.selectionEnd;
          let val = inputText.value;
          inputText.value = val.slice(0, start) + key + val.slice(end);
          // Place cursor just after inserted character(s)
          inputText.selectionStart = inputText.selectionEnd = start + key.length;
        }
        inputText.dispatchEvent(new Event('input'));
        window._vk_updating = false;
      };
    } else {
      btn.textContent = key;
      btn.onclick = () => {
        inputText.value = insertAtCursor(inputText, key);
        inputText.dispatchEvent(new Event('input'));
      };
    }
    rowDiv.appendChild(btn);
  });
  vkDevanagari.appendChild(rowDiv);
});

// Virtual Keyboard - Tamil (basic set)
const tamilKeys = ['அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஐ','ஒ','ஓ','ஔ','க','ங','ச','ஞ','ட','ண','த','ந','ப','ம','ய','ர','ல','வ','ழ','ள','ற','ன','ஷ','ஸ','ஹ'];
tamilKeys.forEach(key => {
  const btn = document.createElement('button');
  btn.className = 'vk-btn';
  btn.textContent = key;
  btn.onclick = () => {
    inputText.value += key;
    inputText.dispatchEvent(new Event('input'));
  };
  vkTamil.appendChild(btn);
});

// Keyboard toggle logic
function showKeyboard(type) {
  vkDevanagari.style.display = 'none';
  vkTamil.style.display = 'none';
  vkLabel.style.display = 'none';
  showDevaBtn.classList.remove('active');
  showTamilBtn.classList.remove('active');
  hideVKBtn.classList.remove('active');
  if (type === 'devanagari') {
    vkDevanagari.style.display = 'flex';
    vkLabel.textContent = 'Devanagari Virtual Keyboard';
    vkLabel.style.display = 'block';
    showDevaBtn.classList.add('active');
  } else if (type === 'tamil') {
    vkTamil.style.display = 'flex';
    vkLabel.textContent = 'Tamil Virtual Keyboard';
    vkLabel.style.display = 'block';
    showTamilBtn.classList.add('active');
  } else {
    // Hide all
    hideVKBtn.classList.add('active');
  }
}
showDevaBtn.addEventListener('click', () => showKeyboard('devanagari'));
showTamilBtn.addEventListener('click', () => showKeyboard('tamil'));
hideVKBtn.addEventListener('click', () => showKeyboard('none'));

// On mobile, show keyboard as default and style larger
function isMobile() {
  return window.innerWidth <= 700;
}
window.addEventListener('DOMContentLoaded', () => {
  if (isMobile()) {
    showKeyboard('devanagari');
  } else {
    showKeyboard('none');
  }
});

function autoResizeAndFont() {
  // Auto-expand vertically
  inputText.style.height = 'auto';
  inputText.style.height = inputText.scrollHeight + 'px';
  // Shrink font size if text is too wide
  inputText.classList.remove('shrink-font', 'shrink-font-more', 'shrink-font-min');
  if (inputText.scrollWidth > inputText.clientWidth * 1.05) {
    inputText.classList.add('shrink-font');
  }
  if (inputText.scrollWidth > inputText.clientWidth * 1.25) {
    inputText.classList.remove('shrink-font');
    inputText.classList.add('shrink-font-more');
  }
  if (inputText.scrollWidth > inputText.clientWidth * 1.5) {
    inputText.classList.remove('shrink-font-more');
    inputText.classList.add('shrink-font-min');
  }
}



// Helper: is Devanagari consonant
function isConsonant(ch) {
  // Basic Devanagari consonant range + nukta/extra + plain nukta
  return /[क-हक़-य़ऱऴऩ़]/.test(ch);
}

function getCursorPos(textarea) {
  return textarea.selectionStart;
}

function updateDevanagariKeyboard() {
  // Determine if prior char is consonant
  const pos = getCursorPos(inputText);
  const val = inputText.value;
  const prev = pos > 0 ? val[pos-1] : '';
  const useMatra = isConsonant(prev);
  // Rebuild first two rows
  const rows = Array.from(vkDevanagari.children);
  if (rows.length < 2) return;
  // Row 1
  Array.from(rows[0].children).forEach((btn, i) => {
    if (i < vowelKeys.length) {
      btn.textContent = useMatra ? vowelMatras[i] : vowelKeys[i];
      btn.title = useMatra ? 'Matra' : 'Vowel';
    }
  });
  // Row 2
  Array.from(rows[1].children).forEach((btn, i) => {
    if (i < vowelRow2.length) {
      btn.textContent = useMatra ? vowelMatras2[i] : vowelRow2[i];
      btn.title = useMatra ? 'Matra' : 'Vowel';
    }
  });
}

function handleDevanagariKeyInput(key, i, useMatra, isRow2) {
  if (useMatra) {
    // Insert matra
    if (!isRow2) {
      inputText.value = insertAtCursor(inputText, vowelMatras[i]);
    } else {
      inputText.value = insertAtCursor(inputText, vowelMatras2[i]);
    }
  } else {
    // Insert full vowel
    if (!isRow2) {
      inputText.value = insertAtCursor(inputText, vowelKeys[i]);
    } else {
      inputText.value = insertAtCursor(inputText, vowelRow2[i]);
    }
  }
  inputText.dispatchEvent(new Event('input'));
}

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  return value.slice(0, start) + text + value.slice(end);
}

// Prevent user-typed input, allow only virtual keyboard
inputText.addEventListener('keydown', function(e) {
  e.preventDefault();
});
inputText.addEventListener('input', function(e) {
  autoResizeAndFont();
  updateDevanagariKeyboard();
});
inputText.addEventListener('click', updateDevanagariKeyboard);
inputText.addEventListener('keyup', updateDevanagariKeyboard);
window.addEventListener('DOMContentLoaded', updateDevanagariKeyboard);

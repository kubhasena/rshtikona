// Devanagari Virtual Keyboard (Best Practices)
// Only virtual keyboard input, cursor movement allowed, matra logic, dn-dravida font

const LAYOUT = [
  ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ','ऽ'],
  ['ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ','ं','ः','ஃ'],
  ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ'],
  ['ट','ठ','ड','ढ','ण','त़','श़','द़','ऱ','ऩ'],
  ['त','थ','द','ध','न','प','फ','ब','भ','म'],
  ['य','र','ल','व','श','ष','स','ह','ऴ','ळ'],
  ['।', '॥', ' ', '<', '↵']
];
const VOWELS = ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ'];
const MATRAS = ['्','ा','ि','ी','ु','ॖ','ू','ृ','ॢ'];
const VOWELS2 = ['ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ'];
const MATRAS2 = ['ॆ','े','ॊ','ो','ै','ॅ','ौ'];
const ALT_LAYOUT = [
  ['१','२','३','४','५','६','७','८','९','०'],
  ['।','॥','-','—','(',')','[',']','{','}'],
  ['॰','%','@','#','&','*','/','\\','+','=','‚'], // added comma here (as '‚' for visual distinction, or use ',' if you want plain)
  ['॑','॒','॓','॔','ॕ','ॖ','ॗ','ॢ','ॣ','ॱ'], // Example Vedic svaras and marks
  ['←',''] // ← to return to main keyboard
];

let showingAlt = false;

const textarea = document.getElementById('inputText');
const keyboard = document.getElementById('vk-devanagari');

// Utility: Detect mobile device
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// On mobile: always show keyboard, set textarea to readonly, allow tap-to-move-cursor
if (isMobile()) {
  textarea.readOnly = true;
  keyboard.style.display = 'block';
  // Allow tap to move cursor by toggling readonly off briefly
  textarea.addEventListener('touchend', function(e) {
    const wasReadOnly = textarea.readOnly;
    textarea.readOnly = false;
    setTimeout(() => {
      textarea.readOnly = wasReadOnly;
    }, 100);
  });
} else {
  textarea.readOnly = false;
  // Show/hide keyboard on focus/blur as before
  textarea.addEventListener('focus', () => {
    keyboard.style.display = 'block';
    updateVowelKeys();
  });
  textarea.addEventListener('blur', () => {
    setTimeout(() => { keyboard.style.display = 'none'; }, 100);
  });
}
// Always prevent blur when clicking keyboard
keyboard.addEventListener('mousedown', e => {
  e.preventDefault();
});

// Remove previous event blocks
// Only set textarea.readOnly on mobile to prevent default keyboard
if (isMobile()) {
  textarea.readOnly = true;
} else {
  textarea.readOnly = false;
}

// Remove these lines if present:
// textarea.addEventListener('keydown', e => e.preventDefault());
// textarea.addEventListener('paste', e => e.preventDefault());

function isConsonant(ch) {
  return /[क-हक़-य़ऱऴऩ़]/.test(ch);
}

function updateVowelKeys() {
  const pos = textarea.selectionStart;
  const val = textarea.value;
  const prev = pos > 0 ? val[pos-1] : '';
  const useMatra = isConsonant(prev);
  // Row 1
  LAYOUT[0].forEach((key, i) => {
    const btn = keyboard.querySelector(`[data-key="${key}"]`);
    if (btn && i < VOWELS.length) {
      btn.textContent = useMatra ? MATRAS[i] : VOWELS[i];
      btn.setAttribute('data-matra', useMatra ? '1' : '0');
    }
  });
  // Row 2
  LAYOUT[1].forEach((key, i) => {
    const btn = keyboard.querySelector(`[data-key="${key}"]`);
    if (btn && i < VOWELS2.length) {
      btn.textContent = useMatra ? MATRAS2[i] : VOWELS2[i];
      btn.setAttribute('data-matra', useMatra ? '1' : '0');
    }
  });
}

function insertAtCursor(text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  textarea.value = val.slice(0, start) + text + val.slice(end);
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
  updateVowelKeys();
}

function handleBackspace() {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  if (start === 0 && end === 0) return;
  let val = textarea.value;
  if (start > 0 && val[start-1] === '़' && start > 1) {
    textarea.value = val.slice(0, start-2) + val.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start-2;
  } else if (start > 0) {
    textarea.value = val.slice(0, start-1) + val.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start-1;
  }
  textarea.focus();
  updateVowelKeys();
}

function handleKeyClick(key, row, idx) {
  // Vowel/matra logic
  if (row === 0 && idx < VOWELS.length) {
    const pos = textarea.selectionStart;
    const val = textarea.value;
    const prev = pos > 0 ? val[pos-1] : '';
    if (isConsonant(prev)) {
      insertAtCursor(MATRAS[idx]);
      return;
    } else {
      insertAtCursor(VOWELS[idx]);
      return;
    }
  }
  if (row === 1 && idx < VOWELS2.length) {
    const pos = textarea.selectionStart;
    const val = textarea.value;
    const prev = pos > 0 ? val[pos-1] : '';
    if (isConsonant(prev)) {
      insertAtCursor(MATRAS2[idx]);
      return;
    } else {
      insertAtCursor(VOWELS2[idx]);
      return;
    }
  }
  // Special keys
  if (key === '<') {
    handleBackspace();
    return;
  }
  if (key === '↵') {
    insertAtCursor('\n');
    return;
  }
  if (key === ' ') {
    insertAtCursor(' ');
    return;
  }
  // Default: insert key
  insertAtCursor(key);
}

function buildKeyboard() {
  keyboard.innerHTML = '';
  if (!showingAlt) {
    LAYOUT.forEach((row, rowIdx) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'vk-row';
      // For last row, add extra key at the start
      if (rowIdx === LAYOUT.length - 1) {
        const altBtn = document.createElement('button');
        altBtn.type = 'button';
        altBtn.className = 'vk-btn dn-dravida';
        altBtn.setAttribute('data-key', 'alt');
        altBtn.textContent = '१२३';
        altBtn.title = 'More (numbers, punctuation, svaras)';
        altBtn.onclick = () => {
          showingAlt = true;
          buildKeyboard();
        };
        rowDiv.appendChild(altBtn);
      }
      row.forEach((key, keyIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vk-btn dn-dravida';
        btn.setAttribute('data-key', key);
        btn.textContent = key;
        btn.onclick = () => handleKeyClick(key, rowIdx, keyIdx);
        rowDiv.appendChild(btn);
      });
      keyboard.appendChild(rowDiv);
    });
  } else {
    ALT_LAYOUT.forEach((row, rowIdx) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'vk-row';
      row.forEach((key, keyIdx) => {
        if (rowIdx === ALT_LAYOUT.length - 1 && key === '←') {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'vk-btn dn-dravida';
          btn.setAttribute('data-key', 'main');
          btn.textContent = '←';
          btn.title = 'Back to Devanagari';
          btn.onclick = () => {
            showingAlt = false;
            buildKeyboard();
          };
          rowDiv.appendChild(btn);
        } else if (key) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'vk-btn dn-dravida';
          btn.setAttribute('data-key', key);
          btn.textContent = key;
          btn.onclick = () => insertAtCursor(key);
          rowDiv.appendChild(btn);
        }
      });
      keyboard.appendChild(rowDiv);
    });
  }
}

// Initial build
buildKeyboard();
updateVowelKeys();

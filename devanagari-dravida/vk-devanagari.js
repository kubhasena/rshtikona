// Devanagari Virtual Keyboard (Best Practices, Mobile Friendly)
// Only virtual keyboard input, cursor-aware, matra logic, dn-dravida font

const DEVANAGARI_LAYOUT = [
  ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ','ऽ'],
  ['ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ','ं','ः','ஃ'],
  ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ'],
  ['ट','ठ','ड','ढ','ण','त़','श़','द़','ऱ','ऩ'],
  ['त','थ','द','ध','न','प','फ','ब','भ','म'],
  ['य','र','ल','व','श','ष','स','ह','ऴ','ळ'],
  [',', '।', '॥', ' ', '<', '↵']
];
const VOWELS = ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ'];
const MATRAS = ['्','ा','ि','ी','ु','ॖ','ू','ृ','ॢ'];
const VOWELS2 = ['ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ'];
const MATRAS2 = ['ॆ','े','ॊ','ो','ै','ॅ','ौ'];

const textarea = document.getElementById('vk-textarea');
const keyboard = document.getElementById('vk-keyboard');

// Allow cursor movement by mouse/touch
textarea.addEventListener('mousedown', e => { textarea.readOnly = false; });
textarea.addEventListener('touchstart', e => { textarea.readOnly = false; });
textarea.addEventListener('blur', e => { textarea.readOnly = true; });

// Prevent all physical keyboard/IME input
textarea.addEventListener('keydown', e => { e.preventDefault(); });

function isConsonant(ch) {
  return /[क-हक़-य़ऱऴऩ़]/.test(ch);
}

function getCursorPos() {
  return textarea.selectionStart;
}

function setCursorPos(pos) {
  textarea.selectionStart = textarea.selectionEnd = pos;
}

function insertAtCursor(text, cursor, insert) {
  return text.slice(0, cursor) + insert + text.slice(cursor);
}

function handleKey(key, row, idx) {
  let val = textarea.value;
  let cursor = getCursorPos();
  let prev = cursor > 0 ? val[cursor-1] : '';
  // Vowel/matra logic
  if (row === 0 && idx < VOWELS.length) {
    if (isConsonant(prev)) {
      textarea.value = insertAtCursor(val, cursor, MATRAS[idx]);
      setCursorPos(cursor + MATRAS[idx].length);
    } else {
      textarea.value = insertAtCursor(val, cursor, VOWELS[idx]);
      setCursorPos(cursor + VOWELS[idx].length);
    }
  } else if (row === 1 && idx < VOWELS2.length) {
    if (isConsonant(prev)) {
      textarea.value = insertAtCursor(val, cursor, MATRAS2[idx]);
      setCursorPos(cursor + MATRAS2[idx].length);
    } else {
      textarea.value = insertAtCursor(val, cursor, VOWELS2[idx]);
      setCursorPos(cursor + VOWELS2[idx].length);
    }
  } else if (key === '<') {
    // Backspace: handle nukta
    if (cursor > 0) {
      if (val[cursor-1] === '़' && cursor > 1) {
        textarea.value = val.slice(0, cursor-2) + val.slice(cursor);
        setCursorPos(cursor-2);
      } else {
        textarea.value = val.slice(0, cursor-1) + val.slice(cursor);
        setCursorPos(cursor-1);
      }
    }
  } else if (key === '↵') {
    textarea.value = insertAtCursor(val, cursor, '\n');
    setCursorPos(cursor + 1);
  } else if (key === ' ') {
    textarea.value = insertAtCursor(val, cursor, ' ');
    setCursorPos(cursor + 1);
  } else {
    textarea.value = insertAtCursor(val, cursor, key);
    setCursorPos(cursor + key.length);
  }
  textarea.focus();
}

function renderKeyboard() {
  keyboard.innerHTML = '';
  DEVANAGARI_LAYOUT.forEach((row, rowIdx) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'vk-row';
    row.forEach((key, keyIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vk-btn dn-dravida';
      btn.textContent = key === ' ' ? '␣' : key === '<' ? '⌫' : key === '↵' ? '↵' : key;
      btn.title = key === ' ' ? 'Space' : key === '<' ? 'Backspace' : key === '↵' ? 'Enter' : '';
      btn.addEventListener('click', () => handleKey(key, rowIdx, keyIdx));
      rowDiv.appendChild(btn);
    });
    keyboard.appendChild(rowDiv);
  });
}

renderKeyboard();
// Always keep textarea readonly except for cursor movement
textarea.readOnly = true;

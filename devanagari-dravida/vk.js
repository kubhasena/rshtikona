// Devanagari Virtual Keyboard (dn-dravida)
const VK_LAYOUT = [
  ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ','ऽ'],
  ['ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ','ं','ः','ஃ'],
  ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ'],
  ['ट','ठ','ड','ढ','ण','त़','श़','द़','ऱ','ऩ'],
  ['त','थ','द','ध','न','प','फ','ब','भ','म'],
  ['य','र','ल','व','श','ष','स','ह','ऴ','ळ'],
  [',', '।', '॥', ' ', '<', '↵']
];
const VOWELS = ['अ','आ','इ','ई','उ','ॶ','ऊ','ऋ','ऌ','ऎ','ए','ऒ','ओ','ऐ','ऐॅ','औ'];
const MATRAS = ['्','ा','ि','ी','ु','ॖ','ू','ृ','ॢ','ॆ','े','ॊ','ो','ै','ॅ','ौ'];
const NUKTA = '़';
const input = document.getElementById('vk-input');
const keyboard = document.getElementById('vk-keyboard');
input.readOnly = true;
input.setAttribute('inputmode', 'none');
let cursor = 0;
let caretDiv = null;
function isConsonant(ch) {
  return /[क-हक़-य़ऱऴऩ]/.test(ch);
}
function isNukta(ch) {
  return ch === NUKTA;
}
function getMatra(vowel, prev) {
  const idx = VOWELS.indexOf(vowel);
  if (idx !== -1 && (isConsonant(prev) || isNukta(prev))) {
    return MATRAS[idx] || vowel;
  }
  return vowel;
}
function setCursor(pos) {
  cursor = Math.max(0, Math.min(pos, input.value.length));
  input.setSelectionRange(cursor, cursor);
  input.focus();
  renderCaret();
}

function renderCaret() {
  // Remove old caret
  if (caretDiv && caretDiv.parentNode) caretDiv.parentNode.removeChild(caretDiv);
  // Get textarea metrics
  const val = input.value;
  const before = val.slice(0, cursor);
  // Create a hidden span to measure caret position
  let measureSpan = document.createElement('span');
  measureSpan.className = 'dn-dravida';
  measureSpan.style.visibility = 'hidden';
  measureSpan.style.position = 'absolute';
  measureSpan.style.whiteSpace = 'pre-wrap';
  measureSpan.style.fontSize = window.getComputedStyle(input).fontSize;
  measureSpan.style.fontFamily = window.getComputedStyle(input).fontFamily;
  measureSpan.textContent = before;
  document.body.appendChild(measureSpan);
  // Get position relative to textarea
  const inputRect = input.getBoundingClientRect();
  const spanRect = measureSpan.getBoundingClientRect();
  let left = spanRect.width + inputRect.left - input.scrollLeft + 8; // 8px padding
  let top = inputRect.top + 8; // 8px padding
  document.body.removeChild(measureSpan);
  // Create caret
  caretDiv = document.createElement('div');
  caretDiv.className = 'vk-caret';
  caretDiv.style.left = left + 'px';
  caretDiv.style.top = top + 'px';
  caretDiv.style.height = window.getComputedStyle(input).fontSize;
  caretDiv.style.zIndex = 10;
  document.body.appendChild(caretDiv);
}
function insertAtCursor(text) {
  const val = input.value;
  const start = cursor;
  const end = cursor;
  input.value = val.slice(0, start) + text + val.slice(end);
  setCursor(start + text.length);
}
function backspaceAtCursor() {
  const val = input.value;
  if (cursor === 0) return;
  // Nukta logic: if nukta before cursor, remove nukta and previous char
  if (val[cursor-1] === NUKTA && cursor > 1) {
    input.value = val.slice(0, cursor-2) + val.slice(cursor);
    setCursor(cursor-2);
  } else {
    input.value = val.slice(0, cursor-1) + val.slice(cursor);
    setCursor(cursor-1);
  }
}
function handleKey(key) {
  const val = input.value;
  const prev = cursor > 0 ? val[cursor-1] : '';
  if (key === '<') {
    backspaceAtCursor();
  } else if (key === '↵') {
    insertAtCursor('\n');
  } else if (key === ' ') {
    insertAtCursor(' ');
  } else {
    // Vowel/matra logic
    let out = key;
    if (VOWELS.includes(key)) {
      out = getMatra(key, prev);
    }
    insertAtCursor(out);
  }
}
function renderKeyboard() {
  keyboard.innerHTML = '';
  VK_LAYOUT.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'vk-row';
    row.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'vk-btn dn-dravida';
      btn.textContent = key === ' ' ? '␣' : key === '<' ? '⌫' : key === '↵' ? '↵' : key;
      btn.title = key === ' ' ? 'Space' : key === '<' ? 'Backspace' : key === '↵' ? 'Enter' : '';
      btn.onclick = () => handleKey(key);
      rowDiv.appendChild(btn);
    });
    keyboard.appendChild(rowDiv);
  });
}
input.addEventListener('mousedown', e => {
  // Allow cursor movement by click
  setTimeout(() => {
    cursor = input.selectionStart;
    renderCaret();
  }, 0);
});
input.addEventListener('touchstart', e => {
  setTimeout(() => {
    cursor = input.selectionStart;
    renderCaret();
  }, 0);
});
// Prevent physical keyboard input
input.addEventListener('keydown', e => {
  e.preventDefault();
});
renderKeyboard();
setCursor(0);

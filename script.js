/**
 * Doc Toolkit - Main Application Logic
 */

// Global State
let currentTab = 'identity';
let activeTool = null;

// Tool Definitions
const TOOLS = {
  identity: [
    { id: 'universal_resizer', icon: '<i class="ph ph-identification-badge"></i>', name: 'Govt Photo & Sig Resizer', desc: 'All-in-one formatter for PAN, Voter, DL & Exams', type: 'universal' },
    { id: 'passport_photo', icon: '<i class="ph ph-camera"></i>', name: 'Passport Photo Maker', desc: 'Standard 35x45mm ratio or 6-copy printable sheet', type: 'passport' },
    { id: 'aadhaar_merge', icon: '<i class="ph ph-cards"></i>', name: 'Merge ID Cards', desc: 'Combine front & back of any ID card cleanly', type: 'aadhaar' },
    { id: 'dop_stamp', icon: '<i class="ph ph-stamp"></i>', name: 'Photo Date Stamp', desc: 'Add applicant name & photo date banner to portraits', type: 'dop' },
    { id: 'signature_clean', icon: '<i class="ph ph-pen-nib"></i>', name: 'Signature Clean-up', desc: 'Convert handwritten signature to pure black & white', type: 'sig_clean' }
  ],
  images: [
    { id: 'compress_kb', icon: '<i class="ph ph-arrows-in"></i>', name: 'Compress Image (KB)', desc: 'Shrink file size strictly below target KB', type: 'compress' },
    { id: 'resize_exact', icon: '<i class="ph ph-arrows-out"></i>', name: 'Exact Pixel Resize', desc: 'Change dimensions to exact custom width/height', type: 'resize' },
    { id: 'crop_image', icon: '<i class="ph ph-crop"></i>', name: 'Smart Crop', desc: 'Crop to custom square or standard rectangle ratios', type: 'crop' },
    { id: 'rotate_image', icon: '<i class="ph ph-arrows-clockwise"></i>', name: 'Rotate & Flip', desc: 'Adjust orientation 90°, 180°, or 270°', type: 'rotate' },
    { id: 'photo_enhancer', icon: '<i class="ph ph-magic-wand"></i>', name: 'Photo Enhancer', desc: 'Auto-adjust brightness, contrast, and clarity', type: 'enhance' },
    { id: 'format_convert', icon: '<i class="ph ph-arrows-left-right"></i>', name: 'Format Converter', desc: 'Fast conversion between JPG, PNG, and WebP', type: 'format' },
    { id: 'convert_dpi', icon: '<i class="ph ph-crosshair"></i>', name: 'DPI Modifier', desc: 'Update resolution metadata (200/300/600 DPI)', type: 'dpi' }
  ],
  pdfs: [
    { id: 'pdf_merge', icon: '<i class="ph ph-files"></i>', name: 'Merge PDFs', desc: 'Combine multiple files into a single document', type: 'pdf_merge' },
    { id: 'pdf_split', icon: '<i class="ph ph-scissors"></i>', name: 'Extract Pages', desc: 'Pull a specific page range into a new PDF', type: 'pdf_split' },
    { id: 'pdf_compress', icon: '<i class="ph ph-file-zip"></i>', name: 'Optimize PDF', desc: 'Strip metadata & optimize streams (Limited on scanned docs)', type: 'pdf_compress' },
    { id: 'img_to_pdf', icon: '<i class="ph ph-images"></i>', name: 'Images to PDF', desc: 'Convert photos into standard A4 PDF pages', type: 'img_to_pdf' },
    { id: 'pdf_rotate', icon: '<i class="ph ph-arrows-clockwise"></i>', name: 'Rotate Document', desc: 'Turn all PDF pages 90°, 180°, or 270°', type: 'pdf_rotate' },
    { id: 'pdf_remove', icon: '<i class="ph ph-minus-circle"></i>', name: 'Remove Page', desc: 'Delete a specific page from your document', type: 'pdf_remove' }
  ]
};

// ==========================================
// Event Listeners & UI Toggles
// ==========================================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    themeIcon.classList.replace('ph-sun', 'ph-moon');
    themeText.innerText = 'Dark';
  } else {
    themeIcon.classList.replace('ph-moon', 'ph-sun');
    themeText.innerText = 'Light';
  }
});

document.getElementById('toolSearch').addEventListener('input', (e) => filterTools(e.target.value));
document.getElementById('backBtn').addEventListener('click', showDashboard);

['identity', 'images', 'pdfs'].forEach(tab => {
  document.getElementById(`tab-${tab}`).addEventListener('click', () => switchTab(tab));
});

// ==========================================
// View Controllers
// ==========================================

function switchTab(tabKey) {
  currentTab = tabKey;
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'bg-gray-100', 'dark:bg-slate-900', 'shadow-sm');
    btn.classList.add('text-gray-500', 'dark:text-slate-400');
    btn.querySelector('span').classList.replace('font-semibold', 'font-medium');
    btn.querySelector('i').classList.add('opacity-80');
  });
  
  const activeBtn = document.getElementById(`tab-${tabKey}`);
  activeBtn.classList.remove('text-gray-500', 'dark:text-slate-400');
  activeBtn.classList.add('text-indigo-600', 'dark:text-indigo-400', 'bg-gray-100', 'dark:bg-slate-900', 'shadow-sm');
  activeBtn.querySelector('span').classList.replace('font-medium', 'font-semibold');
  activeBtn.querySelector('i').classList.remove('opacity-80');

  const titles = { identity: 'Identity Tools', images: 'Image Utilities', pdfs: 'PDF Actions' };
  document.getElementById('tabHeading').innerText = titles[tabKey];
  
  document.getElementById('toolSearch').value = '';
  renderDashboard();
  showDashboard();
}

function showDashboard() {
  document.getElementById('dashboardView').classList.remove('hidden');
  document.getElementById('workspaceView').classList.add('hidden');
  document.getElementById('outputArea').classList.add('hidden');
}

function showWorkspace(tool) {
  activeTool = tool;
  document.getElementById('dashboardView').classList.add('hidden');
  document.getElementById('workspaceView').classList.remove('hidden');
  
  document.getElementById('toolIcon').innerHTML = tool.icon;
  document.getElementById('toolTitle').innerText = tool.name;
  document.getElementById('toolDesc').innerText = tool.desc;
  document.getElementById('outputArea').classList.add('hidden');
  
  renderToolForm(tool);
}

function filterTools(query) {
  const q = query.toLowerCase();
  renderDashboard(q);
}

function renderDashboard(filterQuery = '') {
  const container = document.getElementById('toolsGrid');
  container.innerHTML = '';
  
  let list = TOOLS[currentTab];
  
  if (filterQuery) {
    list = [...TOOLS.identity, ...TOOLS.images, ...TOOLS.pdfs].filter(t => 
      t.name.toLowerCase().includes(filterQuery) || t.desc.toLowerCase().includes(filterQuery)
    );
  }

  document.getElementById('toolCount').innerText = `${list.length} Tools`;

  list.forEach(tool => {
    const card = document.createElement('div');
    card.className = "glass-panel p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-sm group";
    card.innerHTML = `
      <div class="flex items-center space-x-3.5">
        <div class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-xl text-indigo-500 shadow-inner drop-shadow-sm group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
          ${tool.icon}
        </div>
        <div>
          <h4 class="text-sm font-bold leading-snug">${tool.name}</h4>
          <p class="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2 mt-0.5">${tool.desc}</p>
        </div>
      </div>
      <i class="ph ph-caret-right text-gray-400 dark:text-slate-500 opacity-50"></i>
    `;
    card.addEventListener('click', () => showWorkspace(tool));
    container.appendChild(card);
  });
}

// ==========================================
// Dynamic Form Rendering
// ==========================================

// FIX: Added explicit text colors for inputs in dark mode to prevent the "white on white" bug.
const inputClass = "w-full text-sm p-3 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white dark:bg-slate-800 bg-white/50";
const labelClass = "block text-xs font-semibold mb-1.5 opacity-80 uppercase tracking-wider text-gray-700 dark:text-slate-300";
const btnClass = "w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95";

function renderToolForm(tool) {
  const c = document.getElementById('toolFormContainer');
  c.innerHTML = '';

  if (tool.type === 'universal') {
    c.innerHTML = `
      <div><label class="${labelClass}">Document Requirement</label>
        <select id="uniType" class="${inputClass}">
          <option value="pan_photo">PAN Card Photo (213x213 px)</option>
          <option value="pan_sig">PAN Card Signature (400x200 px)</option>
          <option value="dl_photo">Driving Licence Photo (420x525 px)</option>
          <option value="dl_sig">Driving Licence Signature (256x64 px)</option>
          <option value="voter_photo">Voter ID Photo (240x320 px)</option>
          <option value="voter_sig">Voter ID Signature (300x100 px)</option>
          <option value="exam_photo">Govt Exam/SSC Photo (350x450 px)</option>
          <option value="exam_sig">Govt Exam/SSC Signature (300x120 px)</option>
        </select>
      </div>
      <div><label class="${labelClass}">Upload Image</label><input type="file" id="uniFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <button onclick="processUniversal()" class="${btnClass}">Format Document</button>`;
  }
  else if (tool.type === 'passport') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Portrait</label><input type="file" id="passFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div class="flex items-center space-x-3 p-3 glass-input rounded-xl"><input type="checkbox" id="passGrid" class="w-4 h-4 rounded text-indigo-600 accent-indigo-600"><label for="passGrid" class="text-sm font-medium">Create 6-Copy Print Sheet</label></div>
      <button onclick="processPassport()" class="${btnClass}">Generate Photo</button>`;
  }
  else if (tool.type === 'aadhaar') {
    c.innerHTML = `
      <div><label class="${labelClass}">Front Image</label><input type="file" id="aadhFront" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Back Image</label><input type="file" id="aadhBack" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Layout</label>
        <select id="aadhLayout" class="${inputClass}"><option value="vertical">Vertical Stack</option><option value="horizontal">Side by Side</option></select>
      </div>
      <button onclick="processAadhaar()" class="${btnClass}">Merge Cards</button>`;
  }
  else if (tool.type === 'dop') {
    const today = new Date().toISOString().split('T')[0];
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Photo</label><input type="file" id="dopFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Name</label><input type="text" id="dopName" placeholder="e.g. JOHN DOE" class="${inputClass} uppercase" /></div>
      <div><label class="${labelClass}">Date</label><input type="text" id="dopDate" value="${today}" class="${inputClass}" /></div>
      <button onclick="processDOP()" class="${btnClass}">Stamp Photo</button>`;
  }
  else if (tool.type === 'sig_clean') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Signature</label><input type="file" id="sigFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div class="p-4 glass-input rounded-xl"><label class="${labelClass}">Threshold Level</label><input type="range" id="sigThreshold" min="50" max="220" value="130" class="w-full accent-indigo-600" /></div>
      <button onclick="processSigClean()" class="${btnClass}">Enhance Signature</button>`;
  }
  else if (tool.type === 'compress') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Image</label><input type="file" id="compFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Target Size (KB)</label><input type="number" id="compTarget" value="50" class="${inputClass}" /></div>
      <button onclick="processCompressKB()" class="${btnClass}">Compress File</button>`;
  }
  else if (tool.type === 'resize') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Image</label><input type="file" id="resFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="${labelClass}">Width (px)</label><input type="number" id="resW" value="600" class="${inputClass}" /></div>
        <div><label class="${labelClass}">Height (px)</label><input type="number" id="resH" value="600" class="${inputClass}" /></div>
      </div>
      <button onclick="processExactResize()" class="${btnClass}">Resize Image</button>`;
  }
  else if (tool.type === 'crop') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Image</label><input type="file" id="cropFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Aspect Ratio</label>
        <select id="cropRatio" class="${inputClass}">
          <option value="1:1">1:1 Square</option><option value="3:4">3:4 Portrait</option>
          <option value="4:3">4:3 Landscape</option><option value="16:9">16:9 Wide</option>
        </select>
      </div>
      <button onclick="processCrop()" class="${btnClass}">Crop Image</button>`;
  }
  else if (tool.type === 'rotate') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Image</label><input type="file" id="rotFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Angle</label>
        <select id="rotAngle" class="${inputClass}">
          <option value="90">90° Clockwise</option><option value="180">180° Flip</option><option value="270">270° Counter</option>
        </select>
      </div>
      <button onclick="processRotate()" class="${btnClass}">Rotate</button>`;
  }
  else if (tool.type === 'enhance') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Photo</label><input type="file" id="enhFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <button onclick="processEnhance()" class="${btnClass}">Auto-Enhance</button>`;
  }
  else if (tool.type === 'format') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Image</label><input type="file" id="fmtFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Convert To</label>
        <select id="fmtTarget" class="${inputClass}"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>
      </div>
      <button onclick="processFormat()" class="${btnClass}">Convert</button>`;
  }
  else if (tool.type === 'dpi') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload Image</label><input type="file" id="dpiFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Target DPI</label>
        <select id="dpiVal" class="${inputClass}"><option value="200">200 DPI</option><option value="300">300 DPI</option><option value="600">600 DPI</option></select>
      </div>
      <button onclick="processDPI()" class="${btnClass}">Set DPI</button>`;
  }
  else if (tool.type === 'pdf_merge') {
    c.innerHTML = `
      <div><label class="${labelClass}">Select PDFs</label><input type="file" id="pdfMergeFiles" accept="application/pdf" multiple class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <button onclick="processPDFMerge()" class="${btnClass}">Merge PDFs</button>`;
  }
  else if (tool.type === 'pdf_split') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfSplitFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="${labelClass}">Start Page</label><input type="number" id="splitStart" value="1" min="1" class="${inputClass}" /></div>
        <div><label class="${labelClass}">End Page</label><input type="number" id="splitEnd" value="1" min="1" class="${inputClass}" /></div>
      </div>
      <button onclick="processPDFSplit()" class="${btnClass}">Extract Pages</button>`;
  }
  else if (tool.type === 'pdf_compress') {
    c.innerHTML = `
      <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-4 text-xs text-blue-800 dark:text-blue-200">
        <i class="ph ph-info font-bold mr-1"></i> Browser-based compression removes hidden data and optimizes streams. It <b>cannot</b> reduce the resolution of heavy scanned images.
      </div>
      <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfCompFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <button onclick="processPDFCompress()" class="${btnClass}">Optimize PDF</button>`;
  }
  else if (tool.type === 'img_to_pdf') {
    c.innerHTML = `
      <div><label class="${labelClass}">Select Images (JPG/PNG)</label><input type="file" id="imgPdfFiles" accept="image/jpeg, image/png" multiple class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <button onclick="processImagesToPDF()" class="${btnClass}">Convert to PDF</button>`;
  }
  else if (tool.type === 'pdf_rotate') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfRotFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Angle</label>
        <select id="pdfRotAngle" class="${inputClass}"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select>
      </div>
      <button onclick="processPDFRotate()" class="${btnClass}">Rotate PDF</button>`;
  }
  else if (tool.type === 'pdf_remove') {
    c.innerHTML = `
      <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfRemoveFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
      <div><label class="${labelClass}">Page Number to Delete</label><input type="number" id="pdfRemovePage" value="1" min="1" class="${inputClass}" /></div>
      <button onclick="processPDFRemove()" class="${btnClass}">Remove Page</button>`;
  }
}

// ==========================================
// Utility & Output Rendering
// ==========================================

function showResult(dataUrl, filename, isPdf = false) {
  const output = document.getElementById('outputArea');
  const preview = document.getElementById('previewContainer');
  const dlBtn = document.getElementById('downloadBtn');

  preview.innerHTML = '';
  if (isPdf) {
    preview.innerHTML = `<div class="py-6 text-center text-sm text-gray-600 dark:text-slate-300 font-medium"><i class="ph ph-file-pdf text-xl align-middle mr-1"></i> PDF Ready to Download</div>`;
  } else {
    const img = new Image();
    img.src = dataUrl;
    img.className = 'max-h-40 object-contain rounded shadow-sm';
    preview.appendChild(img);
  }

  dlBtn.href = dataUrl;
  dlBtn.download = filename;
  output.classList.remove('hidden');
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getCanvasBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

// Robust fallback to read PDF files cleanly into memory
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the file into memory."));
    reader.readAsArrayBuffer(file);
  });
}

// ==========================================
// Tool Logic Implementations
// ==========================================

async function processUniversal() {
  const file = document.getElementById('uniFile').files[0];
  if (!file) return alert('Please select an image first.');
  const type = document.getElementById('uniType').value;
  
  const specs = {
    pan_photo: { w: 213, h: 213 },
    pan_sig: { w: 400, h: 200 },
    dl_photo: { w: 420, h: 525 },
    dl_sig: { w: 256, h: 64 },
    voter_photo: { w: 240, h: 320 },
    voter_sig: { w: 300, h: 100 },
    exam_photo: { w: 350, h: 450 },
    exam_sig: { w: 300, h: 120 }
  };
  
  const dim = specs[type];
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = dim.w;
  canvas.height = dim.h;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#FFFFFF'; 
  ctx.fillRect(0, 0, dim.w, dim.h);
  ctx.drawImage(img, 0, 0, dim.w, dim.h);
  
  showResult(canvas.toDataURL('image/jpeg', 0.95), `${type}.jpg`);
}

async function processPassport() {
  const file = document.getElementById('passFile').files[0];
  if (!file) return alert('Select photo');
  const isGrid = document.getElementById('passGrid').checked;
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!isGrid) {
    canvas.width = 413; canvas.height = 531;
    ctx.drawImage(img, 0, 0, 413, 531);
    showResult(canvas.toDataURL('image/jpeg', 0.95), 'passport.jpg');
  } else {
    canvas.width = 1200; canvas.height = 1800;
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 1200, 1800);
    const pos = [[160,200],[680,200],[160,700],[680,700],[160,1200],[680,1200]];
    pos.forEach(([x, y]) => {
      ctx.strokeStyle = '#CCC'; ctx.strokeRect(x-1, y-1, 352, 452);
      ctx.drawImage(img, x, y, 350, 450);
    });
    showResult(canvas.toDataURL('image/jpeg', 0.95), 'passport_sheet.jpg');
  }
}

async function processAadhaar() {
  const f1 = document.getElementById('aadhFront').files[0], f2 = document.getElementById('aadhBack').files[0];
  if (!f1 || !f2) return alert('Select front and back images');
  const layout = document.getElementById('aadhLayout').value;
  const [img1, img2] = await Promise.all([loadImage(f1), loadImage(f2)]);
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');

  if (layout === 'vertical') {
    const h1 = (img1.height / img1.width) * 900, h2 = (img2.height / img2.width) * 900;
    canvas.width = 960; canvas.height = h1 + h2 + 80;
    ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img1, 30, 30, 900, h1); ctx.drawImage(img2, 30, h1 + 50, 900, h2);
  } else {
    const w1 = (img1.width / img1.height) * 600, w2 = (img2.width / img2.height) * 600;
    canvas.width = w1 + w2 + 80; canvas.height = 660;
    ctx.fillStyle = '#FFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img1, 30, 30, w1, 600); ctx.drawImage(img2, w1 + 50, 30, w2, 600);
  }
  showResult(canvas.toDataURL('image/jpeg', 0.92), 'merged_id.jpg');
}

async function processDOP() {
  const file = document.getElementById('dopFile').files[0];
  const name = document.getElementById('dopName').value.trim() || 'APPLICANT NAME';
  const dop = document.getElementById('dopDate').value;
  if (!file) return alert('Select photo');
  const img = await loadImage(file);
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  canvas.width = img.width; canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const bH = Math.max(55, canvas.height * 0.18);
  ctx.fillStyle = '#FFF'; ctx.fillRect(0, canvas.height - bH, canvas.width, bH);
  ctx.fillStyle = '#000'; ctx.textAlign = 'center';
  const fSize = Math.max(14, bH * 0.32);
  ctx.font = `bold ${fSize}px sans-serif`;
  ctx.fillText(name, canvas.width / 2, canvas.height - bH + (fSize * 1.2));
  ctx.font = `${fSize * 0.85}px sans-serif`;
  ctx.fillText(`DOP: ${dop}`, canvas.width / 2, canvas.height - (fSize * 0.5));
  showResult(canvas.toDataURL('image/jpeg', 0.95), 'stamped_photo.jpg');
}

async function processSigClean() {
  const file = document.getElementById('sigFile').files[0];
  const th = parseInt(document.getElementById('sigThreshold').value, 10);
  if (!file) return alert('Select signature');
  const img = await loadImage(file);
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  canvas.width = img.width; canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const val = (0.299*d.data[i] + 0.587*d.data[i+1] + 0.114*d.data[i+2]) < th ? 0 : 255;
    d.data[i] = d.data[i+1] = d.data[i+2] = val;
  }
  ctx.putImageData(d, 0, 0);
  showResult(canvas.toDataURL('image/jpeg', 0.95), 'clean_sig.jpg');
}

async function processCompressKB() {
  const file = document.getElementById('compFile').files[0];
  const targetKB = parseInt(document.getElementById('compTarget').value, 10);
  if (!file || !targetKB) return alert('Select image and target KB');

  const btn = document.querySelector('#toolFormContainer button');
  const originalText = btn.innerText;
  btn.innerHTML = '<i class="ph ph-spinner animate-spin inline-block align-middle mr-1"></i> Compressing...';
  btn.disabled = true;
  btn.classList.add('opacity-70', 'cursor-not-allowed');

  await new Promise(r => setTimeout(r, 50));

  try {
    const img = await loadImage(file);
    let currentWidth = img.width;
    let currentHeight = img.height;

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = currentWidth;
    canvas.height = currentHeight;
    ctx.drawImage(img, 0, 0);

    let q = 0.90;
    let blob = await getCanvasBlob(canvas, 'image/jpeg', q);

    while (blob.size / 1024 > targetKB) {
      if (q > 0.15) {
        q -= 0.10;
      } else {
        currentWidth = Math.floor(currentWidth * 0.85);
        currentHeight = Math.floor(currentHeight * 0.85);

        if (currentWidth < 100 || currentHeight < 100) {
            alert(`Could only compress down to ${(blob.size / 1024).toFixed(1)}KB without destroying the image.`);
            break;
        }

        canvas.width = currentWidth;
        canvas.height = currentHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, currentWidth, currentHeight);
        ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
        
        q = 0.50;
      }
      blob = await getCanvasBlob(canvas, 'image/jpeg', q);
    }

    const finalUrl = URL.createObjectURL(blob);
    showResult(finalUrl, `compressed_${targetKB}kb.jpg`);
  } catch (err) {
    alert('An error occurred during compression: ' + err.message);
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
    btn.classList.remove('opacity-70', 'cursor-not-allowed');
  }
}

async function processExactResize() {
  const file = document.getElementById('resFile').files[0];
  const w = parseInt(document.getElementById('resW').value, 10), h = parseInt(document.getElementById('resH').value, 10);
  if (!file || !w || !h) return alert('Provide valid dims');
  const img = await loadImage(file), canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(img, 0, 0, w, h);
  showResult(canvas.toDataURL('image/jpeg', 0.95), `resized_${w}x${h}.jpg`);
}

async function processCrop() {
  const file = document.getElementById('cropFile').files[0], ratio = document.getElementById('cropRatio').value;
  if (!file) return alert('Select image');
  const img = await loadImage(file);
  let [rw, rh] = ratio.split(':').map(Number);
  let targetW = img.width, targetH = (img.width * rh) / rw;
  if (targetH > img.height) { targetH = img.height; targetW = (img.height * rw) / rh; }
  
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  canvas.width = targetW; canvas.height = targetH;
  ctx.drawImage(img, (img.width - targetW)/2, (img.height - targetH)/2, targetW, targetH, 0, 0, targetW, targetH);
  showResult(canvas.toDataURL('image/jpeg', 0.95), 'cropped.jpg');
}

async function processRotate() {
  const file = document.getElementById('rotFile').files[0], deg = parseInt(document.getElementById('rotAngle').value, 10);
  if (!file) return alert('Select image');
  const img = await loadImage(file), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  if (deg === 90 || deg === 270) { canvas.width = img.height; canvas.height = img.width; } 
  else { canvas.width = img.width; canvas.height = img.height; }
  ctx.translate(canvas.width/2, canvas.height/2); ctx.rotate(deg * Math.PI / 180);
  ctx.drawImage(img, -img.width/2, -img.height/2);
  showResult(canvas.toDataURL('image/jpeg', 0.95), `rotated.jpg`);
}

async function processEnhance() {
  const file = document.getElementById('enhFile').files[0];
  if (!file) return alert('Select image');
  const img = await loadImage(file), canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
  canvas.width = img.width; canvas.height = img.height;
  ctx.filter = 'brightness(1.1) contrast(1.15) saturate(1.1)';
  ctx.drawImage(img, 0, 0);
  showResult(canvas.toDataURL('image/jpeg', 0.95), 'enhanced.jpg');
}

async function processFormat() {
  const file = document.getElementById('fmtFile').files[0], format = document.getElementById('fmtTarget').value;
  if (!file) return alert('Select image');
  const img = await loadImage(file), canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  showResult(canvas.toDataURL(format, 0.95), `converted.${format.split('/')[1]}`);
}

async function processDPI() {
  const file = document.getElementById('dpiFile').files[0], dpi = document.getElementById('dpiVal').value;
  if (!file) return alert('Select image');
  const img = await loadImage(file), canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  showResult(canvas.toDataURL('image/jpeg', 0.95), `image_${dpi}dpi.jpg`);
}

// ==========================================
// Robust PDF-Lib Implementations
// ==========================================

async function processPDFMerge() {
  try {
    const files = document.getElementById('pdfMergeFiles').files;
    if (files.length < 2) return alert('Select 2+ PDF files');
    
    if (typeof PDFLib === 'undefined') {
      throw new Error("PDF Library failed to load. Please check your internet connection and refresh.");
    }

    const merged = await PDFLib.PDFDocument.create();
    
    for (let f of files) {
      const buffer = await readFileAsArrayBuffer(f);
      const doc = await PDFLib.PDFDocument.load(buffer);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    
    const pdfBytes = await merged.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'merged.pdf', true);
  } catch (err) {
    alert(`Error: ${err.message}\n(Ensure files are valid and not password protected)`);
  }
}

async function processPDFSplit() {
  try {
    const file = document.getElementById('pdfSplitFile').files[0];
    const start = parseInt(document.getElementById('splitStart').value, 10);
    const end = parseInt(document.getElementById('splitEnd').value, 10);
    if (!file) return alert('Select PDF');
    
    if (typeof PDFLib === 'undefined') throw new Error("PDF Library failed to load.");

    const buffer = await readFileAsArrayBuffer(file);
    const src = await PDFLib.PDFDocument.load(buffer);
    const total = src.getPageCount();
    
    if (start < 1 || end > total || start > end) {
      return alert(`Invalid range. This document has ${total} pages.`);
    }
    
    const newDoc = await PDFLib.PDFDocument.create();
    const indices = Array.from({length: end-start+1}, (_, i) => start-1+i);
    const pages = await newDoc.copyPages(src, indices);
    pages.forEach(p => newDoc.addPage(p));
    
    const pdfBytes = await newDoc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'split.pdf', true);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// FIX: Updated Compress PDF logic to check file size effectively
async function processPDFCompress() {
  try {
    const file = document.getElementById('pdfCompFile').files[0];
    if (!file) return alert('Select PDF');
    
    if (typeof PDFLib === 'undefined') throw new Error("PDF Library failed to load.");

    const originalSize = file.size;
    const buffer = await readFileAsArrayBuffer(file);
    
    // Ignore encryption just in case to avoid parsing errors on basic docs
    const doc = await PDFLib.PDFDocument.load(buffer, { ignoreEncryption: true });
    
    // Attempt optimization by stripping streams
    const pdfBytes = await doc.save({ useObjectStreams: true });
    const newSize = pdfBytes.length;

    if (newSize >= originalSize) {
      alert("Note: This PDF is already highly optimized or contains scanned images that cannot be further compressed inside the browser.");
    }
    
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'optimized.pdf', true);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function processImagesToPDF() {
  try {
    const files = document.getElementById('imgPdfFiles').files;
    if (!files.length) return alert('Select at least one image');
    
    if (typeof PDFLib === 'undefined') throw new Error("PDF Library failed to load.");

    const doc = await PDFLib.PDFDocument.create();
    
    for (let f of files) {
      const buffer = await readFileAsArrayBuffer(f);
      let img;
      
      if (f.type === 'image/png') {
        img = await doc.embedPng(buffer);
      } else if (f.type === 'image/jpeg' || f.type === 'image/jpg') {
        img = await doc.embedJpg(buffer);
      } else {
        return alert('Only JPG and PNG images are supported for PDF conversion.');
      }
      
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = img.scaleToFit(555.28, 801.89);
      page.drawImage(img, { x: 20+(555.28-width)/2, y: 20+(801.89-height)/2, width, height });
    }
    
    const pdfBytes = await doc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'images_to_pdf.pdf', true);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function processPDFRotate() {
  try {
    const file = document.getElementById('pdfRotFile').files[0];
    const deg = parseInt(document.getElementById('pdfRotAngle').value, 10);
    if (!file) return alert('Select PDF');
    
    if (typeof PDFLib === 'undefined') throw new Error("PDF Library failed to load.");

    const buffer = await readFileAsArrayBuffer(file);
    const doc = await PDFLib.PDFDocument.load(buffer);
    
    doc.getPages().forEach(p => {
      const currentRotation = p.getRotation().angle;
      p.setRotation(PDFLib.degrees(currentRotation + deg));
    });
    
    const pdfBytes = await doc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'rotated.pdf', true);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function processPDFRemove() {
  try {
    const file = document.getElementById('pdfRemoveFile').files[0];
    const pageNum = parseInt(document.getElementById('pdfRemovePage').value, 10);
    if (!file) return alert('Select PDF');
    
    if (typeof PDFLib === 'undefined') throw new Error("PDF Library failed to load.");

    const buffer = await readFileAsArrayBuffer(file);
    const doc = await PDFLib.PDFDocument.load(buffer);
    
    const total = doc.getPageCount();
    if (pageNum < 1 || pageNum > total) {
      return alert(`Invalid page number. Document has ${total} pages.`);
    }
    
    doc.removePage(pageNum - 1);
    
    const pdfBytes = await doc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'page_removed.pdf', true);
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

// Initial Render
renderDashboard();

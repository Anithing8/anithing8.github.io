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
    { id: 'pdf_compress', icon: '<i class="ph ph-file-zip"></i>', name: 'Compress PDF', desc: 'Deep image compression to drastically reduce file size', type: 'pdf_compress' },
    { id: 'pdf_merge', icon: '<i class="ph ph-files"></i>', name: 'Merge PDFs', desc: 'Combine multiple files into a single document', type: 'pdf_merge' },
    { id: 'pdf_split', icon: '<i class="ph ph-scissors"></i>', name: 'Extract Pages', desc: 'Pull a specific page range into a new PDF', type: 'pdf_split' },
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

const inputClass = "w-full text-sm p-3 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white dark:bg-slate-800 bg-white/50";
const labelClass = "block text-xs font-semibold mb-1.5 opacity-80 uppercase tracking-wider text-gray-700 dark:text-slate-300";
const btnClass = "w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95";

// Dynamic UI update for compression radio buttons
window.updateCompUI = function(selectedVal) {
  const ids = ['max', 'bal', 'hq'];
  ids.forEach(id => {
    const lbl = document.getElementById(`lbl-${id}`);
    if(id === selectedVal) {
      lbl.className = "relative flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20";
    } else {
      lbl.className = "relative flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 border-solid";
    }
  });
}

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
  else if (tool.type === 'pdf_compress') {
    // NEW ADVANCED COMPRESSION UI
    c.innerHTML = `
      <div>
        <label class="${labelClass}">Select Compression Level</label>
        <div class="space-y-3 mb-5">
          <!-- Maximum -->
          <label class="relative flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50" id="lbl-max">
            <div class="flex items-center gap-3">
              <input type="radio" name="compLevel" value="max" class="w-4 h-4 accent-blue-600" onchange="updateCompUI(this.value)" />
              <div>
                <div class="font-bold text-gray-900 dark:text-white text-[15px]">Maximum Compression</div>
                <div class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Smallest size, lower quality</div>
              </div>
            </div>
            <span class="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#fde68a]">~70%</span>
          </label>
          <!-- Balanced -->
          <label class="relative flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20" id="lbl-bal">
            <div class="flex items-center gap-3">
              <input type="radio" name="compLevel" value="bal" class="w-4 h-4 accent-blue-600" checked onchange="updateCompUI(this.value)" />
              <div>
                <div class="font-bold text-gray-900 dark:text-white text-[15px]">Balanced</div>
                <div class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Good quality, smaller size</div>
              </div>
            </div>
            <span class="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#fde68a]">~50%</span>
          </label>
          <!-- High Quality -->
          <label class="relative flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50" id="lbl-hq">
            <div class="flex items-center gap-3">
              <input type="radio" name="compLevel" value="hq" class="w-4 h-4 accent-blue-600" onchange="updateCompUI(this.value)" />
              <div>
                <div class="font-bold text-gray-900 dark:text-white text-[15px]">High Quality</div>
                <div class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Best quality, moderate compression</div>
              </div>
            </div>
            <span class="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#fde68a]">~30%</span>
          </label>
        </div>
      </div>
      <div>
        <label class="${labelClass}">Upload PDF File</label>
        <input type="file" id="pdfCompFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" />
      </div>
      <p class="text-[10px] text-center text-gray-500 dark:text-slate-400 mt-3"><i class="ph ph-warning-circle inline align-middle"></i> Note: This process converts pages to images. Text will no longer be selectable.</p>
      <button onclick="processPDFCompress()" class="${btnClass}">Compress PDF</button>`;
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

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the file into memory."));
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the file into memory."));
    reader.readAsDataURL(file);
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

// ==========================================
// NEW: PDF Advanced Image Extraction Compression
// ==========================================
async function processPDFCompress() {
  const file = document.getElementById('pdfCompFile').files[0];
  if (!file) return alert('Please select a PDF file first.');
  
  if (typeof window['pdfjs-dist/build/pdf'] === 'undefined' || typeof PDFLib === 'undefined') {
    return alert("Libraries are still loading. Please check your connection and try again.");
  }

  const compLevel = document.querySelector('input[name="compLevel"]:checked').value;
  const btn = document.querySelector('#toolFormContainer button');
  const originalText = btn.innerText;
  
  btn.innerHTML = '<i class="ph ph-spinner animate-spin inline-block align-middle mr-1"></i> Rasterizing & Compressing...';
  btn.disabled = true;
  btn.classList.add('opacity-70', 'cursor-not-allowed');

  // Let UI update
  await new Promise(r => setTimeout(r, 50));

  try {
    // 1. Set Compression Profiles based on UI selection
    let scale = 1.5;   // Balanced
    let quality = 0.6; // Balanced
    if (compLevel === 'max') { scale = 1.0; quality = 0.4; }
    if (compLevel === 'hq')  { scale = 2.0; quality = 0.8; }

    const arrayBuffer = await readFileAsArrayBuffer(file);
    
    // 2. Initialize PDF.js worker
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Load Document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Create new empty PDF
    const newPdf = await PDFLib.PDFDocument.create();

    // 3. Loop through all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      
      // Convert canvas to compressed JPEG
      const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Convert DataURL to bytes for PDFLib
      const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
      
      // Embed Image into new PDF
      const pdfImage = await newPdf.embedJpg(imgBytes);
      const pdfPage = newPdf.addPage([viewport.width, viewport.height]);
      
      // Draw image to fill the new page exactly
      pdfPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
      });
    }
    
    // Save compressed PDF
    const pdfBytes = await newPdf.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), `compressed_${compLevel}.pdf`, true);
    
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
    btn.classList.remove('opacity-70', 'cursor-not-allowed');
  }
}

// ... Rest of the basic PDF manipulation tools
async function processPDFMerge() {
  try {
    const files = document.getElementById('pdfMergeFiles').files;
    if (files.length < 2) return alert('Select 2+ PDF files');
    const merged = await PDFLib.PDFDocument.create();
    for (let f of files) {
      const buffer = await readFileAsArrayBuffer(f);
      const doc = await PDFLib.PDFDocument.load(buffer);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const pdfBytes = await merged.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'merged.pdf', true);
  } catch (err) { alert(`Error: ${err.message}`); }
}

async function processPDFSplit() {
  try {
    const file = document.getElementById('pdfSplitFile').files[0];
    const start = parseInt(document.getElementById('splitStart').value, 10);
    const end = parseInt(document.getElementById('splitEnd').value, 10);
    if (!file) return alert('Select PDF');
    const buffer = await readFileAsArrayBuffer(file);
    const src = await PDFLib.PDFDocument.load(buffer);
    const total = src.getPageCount();
    if (start < 1 || end > total || start > end) return alert(`Invalid range. Document has ${total} pages.`);
    const newDoc = await PDFLib.PDFDocument.create();
    const indices = Array.from({length: end-start+1}, (_, i) => start-1+i);
    const pages = await newDoc.copyPages(src, indices);
    pages.forEach(p => newDoc.addPage(p));
    const pdfBytes = await newDoc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'split.pdf', true);
  } catch (err) { alert(`Error: ${err.message}`); }
}

async function processImagesToPDF() {
  try {
    const files = document.getElementById('imgPdfFiles').files;
    if (!files.length) return alert('Select at least one image');
    const doc = await PDFLib.PDFDocument.create();
    for (let f of files) {
      const buffer = await readFileAsArrayBuffer(f);
      let img;
      if (f.type === 'image/png') img = await doc.embedPng(buffer);
      else if (f.type === 'image/jpeg' || f.type === 'image/jpg') img = await doc.embedJpg(buffer);
      else return alert('Only JPG and PNG supported.');
      const page = doc.addPage([595.28, 841.89]);
      const { width, height } = img.scaleToFit(555.28, 801.89);
      page.drawImage(img, { x: 20+(555.28-width)/2, y: 20+(801.89-height)/2, width, height });
    }
    const pdfBytes = await doc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'images_to_pdf.pdf', true);
  } catch (err) { alert(`Error: ${err.message}`); }
}

async function processPDFRotate() {
  try {
    const file = document.getElementById('pdfRotFile').files[0];
    const deg = parseInt(document.getElementById('pdfRotAngle').value, 10);
    if (!file) return alert('Select PDF');
    const buffer = await readFileAsArrayBuffer(file);
    const doc = await PDFLib.PDFDocument.load(buffer);
    doc.getPages().forEach(p => p.setRotation(PDFLib.degrees(p.getRotation().angle + deg)));
    const pdfBytes = await doc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'rotated.pdf', true);
  } catch (err) { alert(`Error: ${err.message}`); }
}

async function processPDFRemove() {
  try {
    const file = document.getElementById('pdfRemoveFile').files[0];
    const pageNum = parseInt(document.getElementById('pdfRemovePage').value, 10);
    if (!file) return alert('Select PDF');
    const buffer = await readFileAsArrayBuffer(file);
    const doc = await PDFLib.PDFDocument.load(buffer);
    const total = doc.getPageCount();
    if (pageNum < 1 || pageNum > total) return alert(`Invalid page number.`);
    doc.removePage(pageNum - 1);
    const pdfBytes = await doc.save();
    showResult(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })), 'page_removed.pdf', true);
  } catch (err) { alert(`Error: ${err.message}`); }
}

// Initial Render
renderDashboard();

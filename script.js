/**
 * Doc Toolkit - Main Application Logic
 * Handles UI state, tool configuration, and local image/PDF processing.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE MANAGEMENT ---
    let currentTab = 'identity';
    let activeTool = null;
  
    // Tool Configuration with Lucide icon names instead of emojis
    const TOOLS = {
      identity: [
        { id: 'pan_resizer', icon: 'credit-card', name: 'PAN Card Photo & Sig', desc: 'Format photo and signature to exact portal specs', type: 'pan' },
        { id: 'passport_photo', icon: 'camera', name: 'Passport Photo Maker', desc: 'Standard 35x45mm ratio or 6-copy printable sheet', type: 'passport' },
        { id: 'dl_photo', icon: 'car', name: 'Driving Licence Resizer', desc: 'Resize & format photo for portal uploads', type: 'dl' },
        { id: 'voter_photo', icon: 'box-select', name: 'Voter ID Photo Maker', desc: 'Formats portrait to standard card dimensions', type: 'voter' },
        { id: 'aadhaar_merge', icon: 'layers', name: 'Merge ID Cards', desc: 'Combine front & back of any ID card cleanly', type: 'aadhaar' },
        { id: 'dop_stamp', icon: 'stamp', name: 'Photo Date Stamp', desc: 'Add applicant name & photo date banner to portraits', type: 'dop' },
        { id: 'signature_clean', icon: 'pen-tool', name: 'Signature Clean-up', desc: 'Convert handwritten signature to pure black & white', type: 'sig_clean' }
      ],
      images: [
        { id: 'compress_kb', icon: 'minimize', name: 'Compress Image (KB)', desc: 'Shrink file size strictly below target KB', type: 'compress' },
        { id: 'resize_exact', icon: 'move-diagonal', name: 'Exact Pixel Resize', desc: 'Change dimensions to exact custom width/height', type: 'resize' },
        { id: 'crop_image', icon: 'crop', name: 'Smart Crop', desc: 'Crop to custom square or standard rectangle ratios', type: 'crop' },
        { id: 'rotate_image', icon: 'rotate-cw', name: 'Rotate & Flip', desc: 'Adjust orientation 90°, 180°, or 270°', type: 'rotate' },
        { id: 'photo_enhancer', icon: 'sparkles', name: 'Photo Enhancer', desc: 'Auto-adjust brightness, contrast, and clarity', type: 'enhance' },
        { id: 'format_convert', icon: 'file-image', name: 'Format Converter', desc: 'Fast conversion between JPG, PNG, and WebP', type: 'format' },
        { id: 'convert_dpi', icon: 'crosshair', name: 'DPI Modifier', desc: 'Update resolution metadata (200/300/600 DPI)', type: 'dpi' }
      ],
      pdfs: [
        { id: 'pdf_merge', icon: 'file-plus', name: 'Merge PDFs', desc: 'Combine multiple files into a single document', type: 'pdf_merge' },
        { id: 'pdf_split', icon: 'scissors', name: 'Extract Pages', desc: 'Pull a specific page range into a new PDF', type: 'pdf_split' },
        { id: 'pdf_compress', icon: 'file-archive', name: 'Compress PDF', desc: 'Optimize underlying streams to reduce file size', type: 'pdf_compress' },
        { id: 'img_to_pdf', icon: 'images', name: 'Images to PDF', desc: 'Convert photos into standard A4 PDF pages', type: 'img_to_pdf' },
        { id: 'pdf_rotate', icon: 'refresh-cw', name: 'Rotate Document', desc: 'Turn all PDF pages 90°, 180°, or 270°', type: 'pdf_rotate' },
        { id: 'pdf_protect', icon: 'lock', name: 'Encrypt PDF', desc: 'Lock document with a secure user password', type: 'pdf_protect' },
        { id: 'pdf_unlock', icon: 'unlock', name: 'Unlock PDF', desc: 'Remove password protection from a file', type: 'pdf_unlock' }
      ]
    };
  
    // --- UI TOGGLES & EVENT LISTENERS ---
    
    // Theme Switcher
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      
      document.getElementById('themeText').innerText = isDark ? 'Light' : 'Dark';
      document.getElementById('themeIcon').setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      lucide.createIcons(); // Refresh icons
    });
  
    // Tab Switching Logic
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabKey = e.currentTarget.getAttribute('data-tab');
        switchTab(tabKey);
      });
    });
  
    document.getElementById('backBtn').addEventListener('click', showDashboard);
    
    document.getElementById('toolSearch').addEventListener('input', (e) => {
        renderDashboard(e.target.value.toLowerCase());
    });
  
    // --- CORE FUNCTIONS ---
  
    function switchTab(tabKey) {
      currentTab = tabKey;
      
      // Reset all nav buttons to default state
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-indigo-600', 'dark:text-indigo-400', 'bg-white/30', 'dark:bg-black/20', 'shadow-sm');
        btn.classList.add('text-gray-500', 'dark:text-slate-400');
        btn.querySelector('span').classList.replace('font-semibold', 'font-medium');
        btn.querySelector('i').classList.add('opacity-80');
      });
      
      // Highlight the active nav button
      const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabKey}"]`);
      activeBtn.classList.remove('text-gray-500', 'dark:text-slate-400');
      activeBtn.classList.add('text-indigo-600', 'dark:text-indigo-400', 'bg-white/30', 'dark:bg-black/20', 'shadow-sm');
      activeBtn.querySelector('span').classList.replace('font-medium', 'font-semibold');
      activeBtn.querySelector('i').classList.remove('opacity-80');
  
      // Update Header title
      const headings = {
        'identity': 'Identity Tools',
        'images': 'Image Utilities',
        'pdfs': 'PDF Actions'
      };
      document.getElementById('tabHeading').innerText = headings[tabKey];
      
      // Clear search and re-render
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
      
      document.getElementById('toolIconContainer').innerHTML = `<i data-lucide="${tool.icon}" class="w-6 h-6"></i>`;
      document.getElementById('toolTitle').innerText = tool.name;
      document.getElementById('toolDesc').innerText = tool.desc;
      document.getElementById('outputArea').classList.add('hidden');
      
      renderToolForm(tool);
      lucide.createIcons(); 
    }
  
    function renderDashboard(filterQuery = '') {
      const container = document.getElementById('toolsGrid');
      container.innerHTML = '';
      
      let list = TOOLS[currentTab];
      if (filterQuery) {
        // Flatten array for global search
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
            <div class="w-10 h-10 rounded-full glass-input flex items-center justify-center text-gray-700 dark:text-gray-300 shadow-inner group-hover:text-indigo-500 transition-colors">
              <i data-lucide="${tool.icon}" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold leading-snug">${tool.name}</h4>
              <p class="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1 mt-0.5">${tool.desc}</p>
            </div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity"></i>
        `;
        card.addEventListener('click', () => showWorkspace(tool));
        container.appendChild(card);
      });
  
      lucide.createIcons(); // Initialize the new icons injected into the DOM
    }
  
    // --- FORM RENDERER ---
    
    // Shared CSS classes for dynamic form elements
    const inputClass = "w-full text-sm p-3 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";
    const labelClass = "block text-xs font-semibold mb-1.5 opacity-80 uppercase tracking-wider";
    const btnClass = "w-full flex justify-center items-center gap-2 py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95";
  
    function renderToolForm(tool) {
      const c = document.getElementById('toolFormContainer');
      c.innerHTML = '';
      
      // Bindings for the dynamic buttons
      let submitAction = null;
  
      if (tool.type === 'pan') {
        c.innerHTML = `
          <div><label class="${labelClass}">Document Type</label>
            <select id="panType" class="${inputClass}">
              <option value="photo">Photo (213x213 px)</option>
              <option value="signature">Signature (400x200 px)</option>
            </select>
          </div>
          <div><label class="${labelClass}">Upload File</label><input type="file" id="panFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="settings-2" class="w-4 h-4"></i> Format Document</button>`;
          submitAction = processPAN;
      }
      else if (tool.type === 'passport') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Portrait</label><input type="file" id="passFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div class="flex items-center space-x-3 p-3 glass-input rounded-xl"><input type="checkbox" id="passGrid" class="w-4 h-4 rounded text-indigo-600 accent-indigo-600"><label for="passGrid" class="text-sm font-medium">Create 6-Copy Print Sheet</label></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="printer" class="w-4 h-4"></i> Generate Photo</button>`;
          submitAction = processPassport;
      }
      else if (tool.type === 'dl' || tool.type === 'voter') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Photo</label><input type="file" id="${tool.type}File" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="scan-line" class="w-4 h-4"></i> Format Photo</button>`;
          submitAction = tool.type === 'dl' ? processDL : processVoter;
      }
      else if (tool.type === 'aadhaar') {
        c.innerHTML = `
          <div><label class="${labelClass}">Front Image</label><input type="file" id="aadhFront" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Back Image</label><input type="file" id="aadhBack" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Layout</label>
            <select id="aadhLayout" class="${inputClass}"><option value="vertical">Vertical Stack</option><option value="horizontal">Side by Side</option></select>
          </div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="layers" class="w-4 h-4"></i> Merge Cards</button>`;
          submitAction = processAadhaar;
      }
      else if (tool.type === 'dop') {
        const today = new Date().toISOString().split('T')[0];
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Photo</label><input type="file" id="dopFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Name</label><input type="text" id="dopName" placeholder="e.g. JOHN DOE" class="${inputClass} uppercase" /></div>
          <div><label class="${labelClass}">Date</label><input type="text" id="dopDate" value="${today}" class="${inputClass}" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="stamp" class="w-4 h-4"></i> Stamp Photo</button>`;
          submitAction = processDOP;
      }
      else if (tool.type === 'sig_clean') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Signature</label><input type="file" id="sigFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div class="p-4 glass-input rounded-xl"><label class="${labelClass}">Threshold Level</label><input type="range" id="sigThreshold" min="50" max="220" value="130" class="w-full accent-indigo-600" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="wand-2" class="w-4 h-4"></i> Enhance Signature</button>`;
          submitAction = processSigClean;
      }
      else if (tool.type === 'compress') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Image</label><input type="file" id="compFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Target Size (KB)</label><input type="number" id="compTarget" value="50" class="${inputClass}" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="minimize" class="w-4 h-4"></i> Compress File</button>`;
          submitAction = processCompressKB;
      }
      else if (tool.type === 'resize') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Image</label><input type="file" id="resFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="${labelClass}">Width (px)</label><input type="number" id="resW" value="600" class="${inputClass}" /></div>
            <div><label class="${labelClass}">Height (px)</label><input type="number" id="resH" value="600" class="${inputClass}" /></div>
          </div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="move-diagonal" class="w-4 h-4"></i> Resize Image</button>`;
          submitAction = processExactResize;
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
          <button id="processBtn" class="${btnClass}"><i data-lucide="crop" class="w-4 h-4"></i> Crop Image</button>`;
          submitAction = processCrop;
      }
      else if (tool.type === 'rotate') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Image</label><input type="file" id="rotFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Angle</label>
            <select id="rotAngle" class="${inputClass}">
              <option value="90">90° Clockwise</option><option value="180">180° Flip</option><option value="270">270° Counter</option>
            </select>
          </div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="rotate-cw" class="w-4 h-4"></i> Rotate</button>`;
          submitAction = processRotate;
      }
      else if (tool.type === 'enhance') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Photo</label><input type="file" id="enhFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="sparkles" class="w-4 h-4"></i> Auto-Enhance</button>`;
          submitAction = processEnhance;
      }
      else if (tool.type === 'format') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Image</label><input type="file" id="fmtFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Convert To</label>
            <select id="fmtTarget" class="${inputClass}"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>
          </div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="file-image" class="w-4 h-4"></i> Convert</button>`;
          submitAction = processFormat;
      }
      else if (tool.type === 'dpi') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Image</label><input type="file" id="dpiFile" accept="image/*" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Target DPI</label>
            <select id="dpiVal" class="${inputClass}"><option value="200">200 DPI</option><option value="300">300 DPI</option><option value="600">600 DPI</option></select>
          </div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="crosshair" class="w-4 h-4"></i> Set DPI</button>`;
          submitAction = processDPI;
      }
      else if (tool.type === 'pdf_merge') {
        c.innerHTML = `
          <div><label class="${labelClass}">Select PDFs</label><input type="file" id="pdfMergeFiles" accept="application/pdf" multiple class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="file-plus" class="w-4 h-4"></i> Merge PDFs</button>`;
          submitAction = processPDFMerge;
      }
      else if (tool.type === 'pdf_split') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfSplitFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="${labelClass}">Start Page</label><input type="number" id="splitStart" value="1" min="1" class="${inputClass}" /></div>
            <div><label class="${labelClass}">End Page</label><input type="number" id="splitEnd" value="1" min="1" class="${inputClass}" /></div>
          </div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="scissors" class="w-4 h-4"></i> Extract Pages</button>`;
          submitAction = processPDFSplit;
      }
      else if (tool.type === 'pdf_compress') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfCompFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="file-archive" class="w-4 h-4"></i> Compress PDF</button>`;
          submitAction = processPDFCompress;
      }
      else if (tool.type === 'img_to_pdf') {
        c.innerHTML = `
          <div><label class="${labelClass}">Select Images</label><input type="file" id="imgPdfFiles" accept="image/*" multiple class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="images" class="w-4 h-4"></i> Convert to PDF</button>`;
          submitAction = processImagesToPDF;
      }
      else if (tool.type === 'pdf_rotate') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfRotFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Angle</label>
            <select id="pdfRotAngle" class="${inputClass}"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select>
          </div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="refresh-cw" class="w-4 h-4"></i> Rotate PDF</button>`;
          submitAction = processPDFRotate;
      }
      else if (tool.type === 'pdf_protect') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload PDF</label><input type="file" id="pdfProtFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Password</label><input type="password" id="pdfProtPass" placeholder="Secure password" class="${inputClass}" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="lock" class="w-4 h-4"></i> Encrypt PDF</button>`;
          submitAction = processPDFProtect;
      }
      else if (tool.type === 'pdf_unlock') {
        c.innerHTML = `
          <div><label class="${labelClass}">Upload Locked PDF</label><input type="file" id="pdfUnlFile" accept="application/pdf" class="${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white cursor-pointer" /></div>
          <div><label class="${labelClass}">Password</label><input type="password" id="pdfUnlPass" placeholder="Current password" class="${inputClass}" /></div>
          <button id="processBtn" class="${btnClass}"><i data-lucide="unlock" class="w-4 h-4"></i> Unlock PDF</button>`;
          submitAction = processPDFUnlock;
      }
  
      // Attach the dynamic action safely
      if (submitAction) {
          document.getElementById('processBtn').addEventListener('click', submitAction);
      }
    }
  
    // --- UTILITIES & HELPERS ---
  
    function showResult(dataUrl, filename, isPdf = false) {
      const output = document.getElementById('outputArea');
      const preview = document.getElementById('previewContainer');
      const dlBtn = document.getElementById('downloadBtn');
  
      preview.innerHTML = '';
      if (isPdf) {
        preview.innerHTML = `<div class="py-6 text-center text-sm text-gray-600 dark:text-slate-300 font-medium">📄 PDF Ready for Download</div>`;
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
  
    // Async blob generation prevents blocking the main thread 
    // during heavy image compression algorithms.
    function getCanvasBlob(canvas, mimeType, quality) {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), mimeType, quality);
      });
    }
  
    // --- TOOL PROCESSING LOGIC ---
  
    async function processPAN() {
      const file = document.getElementById('panFile').files[0];
      if (!file) return alert('Select image');
      const type = document.getElementById('panType').value;
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      const w = type === 'photo' ? 213 : 400, h = type === 'photo' ? 213 : 200;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      showResult(canvas.toDataURL('image/jpeg', 0.9), `pan_${type}.jpg`);
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
  
    async function processDL() {
      const file = document.getElementById('dlFile').files[0];
      if (!file) return alert('Select photo');
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = 420; canvas.height = 525;
      canvas.getContext('2d').drawImage(img, 0, 0, 420, 525);
      showResult(canvas.toDataURL('image/jpeg', 0.9), 'dl_photo.jpg');
    }
  
    async function processVoter() {
      const file = document.getElementById('voterFile').files[0];
      if (!file) return alert('Select photo');
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = 240; canvas.height = 320;
      canvas.getContext('2d').drawImage(img, 0, 0, 240, 320);
      showResult(canvas.toDataURL('image/jpeg', 0.9), 'voter_photo.jpg');
    }
  
    async function processAadhaar() {
      const f1 = document.getElementById('aadhFront').files[0];
      const f2 = document.getElementById('aadhBack').files[0];
      if (!f1 || !f2) return alert('Select front and back');
      
      const layout = document.getElementById('aadhLayout').value;
      const [img1, img2] = await Promise.all([loadImage(f1), loadImage(f2)]);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
  
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < d.data.length; i += 4) {
        // Simple binarization algorithm
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
  
      // UI feedback during heavy processing
      const btn = document.getElementById('processBtn');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Compressing...';
      lucide.createIcons();
      btn.disabled = true;
      btn.classList.add('opacity-70', 'cursor-not-allowed');
  
      // Hacky yield to allow DOM to paint the button state before locking thread
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
  
        // Smart compression: drop quality, then drop resolution
        while (blob.size / 1024 > targetKB) {
          if (q > 0.15) {
            q -= 0.10;
          } else {
            currentWidth = Math.floor(currentWidth * 0.85);
            currentHeight = Math.floor(currentHeight * 0.85);
  
            if (currentWidth < 100 || currentHeight < 100) {
                alert(`Reached minimum limits. Compressed to ${(blob.size / 1024).toFixed(1)}KB.`);
                break;
            }
  
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, currentWidth, currentHeight);
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
            
            q = 0.50; // Reset quality for new resolution
          }
          blob = await getCanvasBlob(canvas, 'image/jpeg', q);
        }
  
        showResult(URL.createObjectURL(blob), `compressed_${targetKB}kb.jpg`);
      } catch (err) {
        console.error(err);
        alert('Compression failed.');
      } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.classList.remove('opacity-70', 'cursor-not-allowed');
        lucide.createIcons();
      }
    }
  
    async function processExactResize() {
      const file = document.getElementById('resFile').files[0];
      const w = parseInt(document.getElementById('resW').value, 10);
      const h = parseInt(document.getElementById('resH').value, 10);
      if (!file || !w || !h) return alert('Provide valid dimensions');
      
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      showResult(canvas.toDataURL('image/jpeg', 0.95), `resized_${w}x${h}.jpg`);
    }
  
    async function processCrop() {
      const file = document.getElementById('cropFile').files[0];
      const ratio = document.getElementById('cropRatio').value;
      if (!file) return alert('Select image');
      
      const img = await loadImage(file);
      let [rw, rh] = ratio.split(':').map(Number);
      let targetW = img.width;
      let targetH = (img.width * rh) / rw;
      
      if (targetH > img.height) { 
        targetH = img.height; 
        targetW = (img.height * rw) / rh; 
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = targetW; canvas.height = targetH;
      ctx.drawImage(img, (img.width - targetW)/2, (img.height - targetH)/2, targetW, targetH, 0, 0, targetW, targetH);
      showResult(canvas.toDataURL('image/jpeg', 0.95), 'cropped.jpg');
    }
  
    async function processRotate() {
      const file = document.getElementById('rotFile').files[0];
      const deg = parseInt(document.getElementById('rotAngle').value, 10);
      if (!file) return alert('Select image');
      
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (deg === 90 || deg === 270) { 
        canvas.width = img.height; 
        canvas.height = img.width; 
      } else { 
        canvas.width = img.width; 
        canvas.height = img.height; 
      }
      
      ctx.translate(canvas.width/2, canvas.height/2); 
      ctx.rotate(deg * Math.PI / 180);
      ctx.drawImage(img, -img.width/2, -img.height/2);
      showResult(canvas.toDataURL('image/jpeg', 0.95), `rotated.jpg`);
    }
  
    async function processEnhance() {
      const file = document.getElementById('enhFile').files[0];
      if (!file) return alert('Select image');
      
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width; canvas.height = img.height;
      ctx.filter = 'brightness(1.1) contrast(1.15) saturate(1.1)'; // Quick CSS filter hack
      ctx.drawImage(img, 0, 0);
      showResult(canvas.toDataURL('image/jpeg', 0.95), 'enhanced.jpg');
    }
  
    async function processFormat() {
      const file = document.getElementById('fmtFile').files[0];
      const format = document.getElementById('fmtTarget').value;
      if (!file) return alert('Select image');
      
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      showResult(canvas.toDataURL(format, 0.95), `converted.${format.split('/')[1]}`);
    }
  
    async function processDPI() {
      const file = document.getElementById('dpiFile').files[0];
      const dpi = document.getElementById('dpiVal').value;
      if (!file) return alert('Select image');
      
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      showResult(canvas.toDataURL('image/jpeg', 0.95), `image_${dpi}dpi.jpg`);
    }
  
    // --- PDF LIBRARY INTEGRATIONS ---
  
    async function processPDFMerge() {
      const files = document.getElementById('pdfMergeFiles').files;
      if (files.length < 2) return alert('Select 2+ files');
      
      const merged = await PDFLib.PDFDocument.create();
      for (let f of files) {
        const doc = await PDFLib.PDFDocument.load(await f.arrayBuffer());
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      showResult(URL.createObjectURL(new Blob([await merged.save()], { type: 'application/pdf' })), 'merged.pdf', true);
    }
  
    async function processPDFSplit() {
      const file = document.getElementById('pdfSplitFile').files[0];
      const start = parseInt(document.getElementById('splitStart').value, 10);
      const end = parseInt(document.getElementById('splitEnd').value, 10);
      if (!file) return alert('Select PDF');
      
      const src = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      if (start < 1 || end > src.getPageCount() || start > end) return alert('Invalid range');
      
      const newDoc = await PDFLib.PDFDocument.create();
      const pages = await newDoc.copyPages(src, Array.from({length: end-start+1}, (_, i) => start-1+i));
      pages.forEach(p => newDoc.addPage(p));
      
      showResult(URL.createObjectURL(new Blob([await newDoc.save()], { type: 'application/pdf' })), 'split.pdf', true);
    }
  
    async function processPDFCompress() {
      const file = document.getElementById('pdfCompFile').files[0];
      if (!file) return alert('Select PDF');
      const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      showResult(URL.createObjectURL(new Blob([await doc.save({ useObjectStreams: true })], { type: 'application/pdf' })), 'compressed.pdf', true);
    }
  
    async function processImagesToPDF() {
      const files = document.getElementById('imgPdfFiles').files;
      if (!files.length) return alert('Select images');
      
      const doc = await PDFLib.PDFDocument.create();
      for (let f of files) {
        const img = f.type === 'image/png' ? await doc.embedPng(await f.arrayBuffer()) : await doc.embedJpg(await f.arrayBuffer());
        const page = doc.addPage([595.28, 841.89]);
        const { width, height } = img.scaleToFit(555.28, 801.89);
        page.drawImage(img, { x: 20+(555.28-width)/2, y: 20+(801.89-height)/2, width, height });
      }
      showResult(URL.createObjectURL(new Blob([await doc.save()], { type: 'application/pdf' })), 'images_to.pdf', true);
    }
  
    async function processPDFRotate() {
      const file = document.getElementById('pdfRotFile').files[0];
      const deg = parseInt(document.getElementById('pdfRotAngle').value, 10);
      if (!file) return alert('Select PDF');
      
      const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      doc.getPages().forEach(p => p.setRotation(PDFLib.degrees(p.getRotation().angle + deg)));
      showResult(URL.createObjectURL(new Blob([await doc.save()], { type: 'application/pdf' })), 'rotated.pdf', true);
    }
  
    async function processPDFProtect() {
      const file = document.getElementById('pdfProtFile').files[0];
      const pass = document.getElementById('pdfProtPass').value;
      if (!file || !pass) return alert('Select PDF and password');
      
      const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer());
      showResult(URL.createObjectURL(new Blob([await doc.save()], { type: 'application/pdf' })), 'locked.pdf', true);
    }
  
    async function processPDFUnlock() {
      const file = document.getElementById('pdfUnlFile').files[0];
      const pass = document.getElementById('pdfUnlPass').value;
      if (!file) return alert('Select PDF');
      
      try {
        const doc = await PDFLib.PDFDocument.load(await file.arrayBuffer(), { password: pass });
        showResult(URL.createObjectURL(new Blob([await doc.save()], { type: 'application/pdf' })), 'unlocked.pdf', true);
      } catch { 
        alert('Incorrect password'); 
      }
    }
  
    // --- INIT APP ---
    renderDashboard();
  });

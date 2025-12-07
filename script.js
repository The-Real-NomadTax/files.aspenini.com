const BASE_URL = 'https://files.aspenini.com/';

const ICONS = {
    mid: '🎵',
    midi: '🎵',
    mp3: '🎵',
    wav: '🎵',
    ogg: '🎵',
    flac: '🎵',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
    svg: '🖼️',
    mp4: '🎬',
    webm: '🎬',
    mov: '🎬',
    avi: '🎬',
    pdf: '📄',
    doc: '📄',
    docx: '📄',
    txt: '📝',
    json: '📋',
    xml: '📋',
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    tar: '📦',
    gz: '📦',
    exe: '⚙️',
    dll: '⚙️',
    js: '💻',
    ts: '💻',
    py: '🐍',
    lua: '🌙',
    rbxl: '🎮',
    rbxm: '🎮',
    rbxlx: '🎮',
    default: '📄'
};

let toastTimeout;
let filesData = null;

function getIcon(ext) {
    return ICONS[ext.toLowerCase()] || ICONS.default;
}

function copyUrl(path, btn) {
    const url = BASE_URL + path;
    
    navigator.clipboard.writeText(url).then(() => {
        btn.classList.add('copied');
        const label = btn.querySelector('span');
        const origText = label.textContent;
        label.textContent = 'Copied!';
        
        showToast('URL copied!');
        
        setTimeout(() => {
            btn.classList.remove('copied');
            label.textContent = origText;
        }, 2000);
    }).catch(() => {
        showToast('Copy failed');
    });
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastMessage');
    
    clearTimeout(toastTimeout);
    text.textContent = msg;
    toast.classList.add('show');
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function renderFiles(data) {
    const container = document.getElementById('fileList');
    
    if (!data.folders || data.folders.length === 0) {
        container.innerHTML = '<div class="empty-state">No files found</div>';
        return;
    }
    
    let html = '';
    
    for (const folder of data.folders) {
        html += `
            <div class="folder-section">
                <div class="folder-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                    </svg>
                    ${folder.name}/
                </div>
                <div class="folder-files">
        `;
        
        for (const file of folder.files) {
            const ext = file.name.split('.').pop();
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
            const icon = getIcon(ext);
            const filePath = `${folder.name}/${file.name}`;
            
            html += `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-icon">${icon}</div>
                        <span class="file-name">${nameWithoutExt}<span class="file-ext">.${ext}</span></span>
                    </div>
                    <div class="file-actions">
                        <button class="btn" onclick="copyUrl('${filePath}', this)" type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                            <span>Copy URL</span>
                        </button>
                        <a href="${filePath}" class="btn btn-download" download>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <span>Download</span>
                        </a>
                    </div>
                </div>
            `;
        }
        
        html += '</div></div>';
    }
    
    container.innerHTML = html;
}

function filterFiles(searchTerm) {
    if (!filesData) return;
    
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        renderFiles(filesData);
        return;
    }
    
    const filtered = {
        folders: filesData.folders.map(folder => {
            const matchingFiles = folder.files.filter(file => 
                file.name.toLowerCase().includes(term) ||
                folder.name.toLowerCase().includes(term)
            );
            
            return {
                name: folder.name,
                files: matchingFiles
            };
        }).filter(folder => folder.files.length > 0)
    };
    
    renderFiles(filtered);
}

async function init() {
    try {
        const response = await fetch('files.json');
        const data = await response.json();
        filesData = data;
        renderFiles(data);
        
        // Setup search functionality
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', (e) => {
            filterFiles(e.target.value);
            clearBtn.style.opacity = e.target.value ? '1' : '0';
        });
        
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            filterFiles('');
            clearBtn.style.opacity = '0';
            searchInput.focus();
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                filterFiles('');
                clearBtn.style.opacity = '0';
            }
        });
        
    } catch (err) {
        console.error('Failed to load files:', err);
        document.getElementById('fileList').innerHTML = 
            '<div class="empty-state">Failed to load files</div>';
    }
}

document.addEventListener('DOMContentLoaded', init);


// ==================== TAB SWITCHING ====================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// ==================== IMAGE CONVERTER ====================
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const successMsg = document.getElementById('successMsg');
const errorMsg = document.getElementById('errorMsg');
const previewArea = document.getElementById('previewArea');
const previewContainer = document.getElementById('previewContainer');
const qualityCheck = document.getElementById('qualityCheck');
const qualitySliderContainer = document.getElementById('qualitySliderContainer');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

let selectedFormat = 'jpg';
let selectedFiles = [];

// Format selection
document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedFormat = this.dataset.format;
    });
});

// Quality control
qualityCheck.addEventListener('change', function() {
    qualitySliderContainer.style.display = this.checked ? 'block' : 'none';
});

qualitySlider.addEventListener('input', function() {
    qualityValue.textContent = this.value;
});

// Upload area
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#FF6B6B';
    uploadArea.style.backgroundColor = '#fff5f5';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.backgroundColor = '#f9f9f9';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.backgroundColor = '#f9f9f9';
    fileInput.files = e.dataTransfer.files;
    handleFiles();
});

fileInput.addEventListener('change', handleFiles);

function handleFiles() {
    selectedFiles = Array.from(fileInput.files);
    if (selectedFiles.length > 0) {
        convertBtn.disabled = false;
        errorMsg.style.display = 'none';
        uploadArea.innerHTML = `<div style="text-align: center;"><i class="fas fa-check-circle" style="font-size: 2rem; color: #28a745; margin-bottom: 0.5rem;"></i><p style="margin-top: 0.5rem;">✓ ${selectedFiles.length} file(s) selected</p></div>`;
    }
}

convertBtn.addEventListener('click', convertImages);

async function convertImages() {
    if (selectedFiles.length === 0) return;

    progressContainer.style.display = 'block';
    convertBtn.disabled = true;
    previewArea.style.display = 'none';
    previewContainer.innerHTML = '';
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';

    const quality = qualityCheck.checked ? parseInt(qualitySlider.value) : 80;
    const results = [];

    for (let i = 0; i < selectedFiles.length; i++) {
        try {
            const file = selectedFiles[i];
            const canvas = await fileToCanvas(file);
            const blob = await canvasToBlob(canvas, selectedFormat, quality);
            const url = URL.createObjectURL(blob);
            const fileName = file.name.split('.')[0] + '.' + selectedFormat;
            
            results.push({ url, fileName, blob });
            progressFill.style.width = ((i + 1) / selectedFiles.length * 100) + '%';
            progressText.textContent = Math.round(((i + 1) / selectedFiles.length * 100)) + '%';
        } catch (error) {
            errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>Error converting ${selectedFiles[i].name}: ${error.message}</span>`;
            errorMsg.style.display = 'block';
        }
    }

    if (results.length > 0) {
        displayPreviews(results);
        successMsg.innerHTML = `<i class="fas fa-check-circle"></i> <span>✓ Successfully converted ${results.length} image(s) to ${selectedFormat.toUpperCase()}</span>`;
        successMsg.style.display = 'block';
    }

    convertBtn.disabled = false;
    progressContainer.style.display = 'none';
}

function fileToCanvas(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function canvasToBlob(canvas, format, quality) {
    return new Promise((resolve, reject) => {
        const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Failed to convert'));
            },
            mimeType,
            quality / 100
        );
    });
}

function displayPreviews(results) {
    previewContainer.innerHTML = '';
    results.forEach(({ url, fileName, blob }) => {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'preview-item';
        previewDiv.innerHTML = `
            <img src="${url}" alt="${fileName}">
            <p>${fileName}</p>
            <small>${(blob.size / 1024).toFixed(2)} KB</small>
            <a href="${url}" download="${fileName}" class="btn btn-small">
                <i class="fas fa-download"></i> Download
            </a>
        `;
        previewContainer.appendChild(previewDiv);
    });
    previewArea.style.display = 'block';
}

// ==================== PDF CONVERTER ====================
const uploadAreaPdf = document.getElementById('uploadAreaPdf');
const fileInputPdf = document.getElementById('fileInputPdf');
const convertPdfBtn = document.getElementById('convertPdfBtn');
const successMsgPdf = document.getElementById('successMsgPdf');
const errorMsgPdf = document.getElementById('errorMsgPdf');
const progressContainerPdf = document.getElementById('progressContainerPdf');
const progressFillPdf = document.getElementById('progressFillPdf');
const progressTextPdf = document.getElementById('progressTextPdf');
const orientationCheck = document.getElementById('orientationCheck');
const pdfFilesInfo = document.getElementById('pdfFilesInfo');

let selectedFilesPdf = [];

uploadAreaPdf.addEventListener('click', () => fileInputPdf.click());

uploadAreaPdf.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadAreaPdf.style.borderColor = '#FF6B6B';
    uploadAreaPdf.style.backgroundColor = '#fff5f5';
});

uploadAreaPdf.addEventListener('dragleave', () => {
    uploadAreaPdf.style.borderColor = '#ddd';
    uploadAreaPdf.style.backgroundColor = '#f9f9f9';
});

uploadAreaPdf.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadAreaPdf.style.borderColor = '#ddd';
    uploadAreaPdf.style.backgroundColor = '#f9f9f9';
    fileInputPdf.files = e.dataTransfer.files;
    handleFilesPdf();
});

fileInputPdf.addEventListener('change', handleFilesPdf);

function handleFilesPdf() {
    selectedFilesPdf = Array.from(fileInputPdf.files);
    if (selectedFilesPdf.length > 0) {
        convertPdfBtn.disabled = false;
        errorMsgPdf.style.display = 'none';
        uploadAreaPdf.innerHTML = `<div style="text-align: center;"><i class="fas fa-check-circle" style="font-size: 2rem; color: #28a745; margin-bottom: 0.5rem;"></i><p style="margin-top: 0.5rem;">✓ ${selectedFilesPdf.length} file(s) selected</p></div>`;
        
        // Show file info
        const totalSize = selectedFilesPdf.reduce((sum, f) => sum + f.size, 0);
        pdfFilesInfo.innerHTML = `<p style="font-size: 0.9rem; color: #666;">Total: ${selectedFilesPdf.length} files | ${(totalSize / 1024 / 1024).toFixed(2)} MB</p>`;
    }
}

convertPdfBtn.addEventListener('click', convertToPdf);

async function convertToPdf() {
    if (selectedFilesPdf.length === 0) return;

    progressContainerPdf.style.display = 'block';
    convertPdfBtn.disabled = true;
    errorMsgPdf.style.display = 'none';
    successMsgPdf.style.display = 'none';

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let isFirstPage = true;

        for (let i = 0; i < selectedFilesPdf.length; i++) {
            try {
                const file = selectedFilesPdf[i];
                const canvas = await fileToCanvas(file);
                
                let imgWidth = pageWidth - 20;
                let imgHeight = (canvas.height / canvas.width) * imgWidth;

                if (imgHeight > pageHeight - 20) {
                    imgHeight = pageHeight - 20;
                    imgWidth = (canvas.width / canvas.height) * imgHeight;
                }

                const xOffset = (pageWidth - imgWidth) / 2;
                const yOffset = (pageHeight - imgHeight) / 2;

                if (!isFirstPage) {
                    pdf.addPage();
                }

                const imgData = canvas.toDataURL('image/jpeg');
                pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
                isFirstPage = false;

                progressFillPdf.style.width = ((i + 1) / selectedFilesPdf.length * 100) + '%';
                progressTextPdf.textContent = Math.round(((i + 1) / selectedFilesPdf.length * 100)) + '%';
            } catch (error) {
                errorMsgPdf.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>Error processing ${selectedFilesPdf[i].name}</span>`;
                errorMsgPdf.style.display = 'block';
            }
        }

        pdf.save('converted-images.pdf');
        successMsgPdf.innerHTML = `<i class="fas fa-check-circle"></i> <span>✓ PDF created successfully! Downloaded as 'converted-images.pdf'</span>`;
        successMsgPdf.style.display = 'block';
    } catch (error) {
        errorMsgPdf.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>PDF conversion error: ${error.message}</span>`;
        errorMsgPdf.style.display = 'block';
    }

    convertPdfBtn.disabled = false;
    progressContainerPdf.style.display = 'none';
}

// ==================== FAQ TOGGLE ====================
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked FAQ if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ==================== MOBILE MENU ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    this.classList.toggle('active');
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ==================== INITIALIZATION ====================
console.log('ImageifyPDF loaded successfully!');

class URLShortener {
    constructor() {
        this.apiBaseUrl = window.location.origin;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        
        this.urlForm = document.getElementById('urlForm');
        this.urlInput = document.getElementById('urlInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = this.submitBtn.querySelector('.btn-text');
        this.btnIcon = this.submitBtn.querySelector('.btn-icon');

        
        this.resultSection = document.getElementById('resultSection');
        this.shortUrlInput = document.getElementById('shortUrl');
        this.copyBtn = document.getElementById('copyBtn');

        
        this.statsLinkSection = document.getElementById('statsLinkSection');
        this.statsUrlInput = document.getElementById('statsUrl');
        this.viewStatsBtn = document.getElementById('viewStatsBtn');

        
        this.productInfo = document.getElementById('productInfo');
        this.productImage = document.getElementById('productImage');
        this.productName = document.getElementById('productName');
        this.brandName = document.getElementById('brandName');
        this.productPrice = document.getElementById('productPrice');
        this.productId = document.getElementById('productId');

        
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
        
        
    }

    bindEvents() {
        this.urlForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.viewStatsBtn.addEventListener('click', () => this.openStatsPage());
        this.statsUrlInput.addEventListener('click', () => this.selectStatsUrl());
        this.urlInput.addEventListener('input', () => this.resetForm());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showToast('Please enter a URL', 'error');
            return;
        }

        if (!this.isValidHypdUrl(url)) {
            this.showToast('Please enter a valid hypd.store URL', 'error');
            return;
        }

        this.showLoading(true);
        this.setSubmitButtonState('loading');

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/shorten`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to shorten URL');
            }

            this.displayResult(data);
            this.showToast('URL shortened successfully!', 'success');

        } catch (error) {
            console.error('Error:', error);
            this.showToast(error.message || 'Something went wrong. Please try again.', 'error');
        } finally {
            this.showLoading(false);
            this.setSubmitButtonState('copy');
        }
    }

    displayResult(data) {
        
        this.urlInput.value = data.shortUrl;
        
        
        this.resultSection.classList.remove('hidden');
        
        
        this.shortUrlInput.value = data.shortUrl;
        
        
        this.statsLinkSection.classList.remove('hidden');
        this.statsUrlInput.value = `${this.apiBaseUrl}/urlstat/${data.shortCode}`;
        
        
        if (data.productInfo) {
            
            setTimeout(() => {
                this.displayProductInfo(data.productInfo);
            }, 100);
        } else {
            this.productInfo.classList.add('hidden');
        }

        
        this.resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    displayProductInfo(productInfo) {
        
        this.productInfo.classList.remove('hidden');
        this.productInfo.style.display = 'block';
        this.productInfo.style.visibility = 'visible';
        this.productInfo.style.opacity = '1';
        this.productInfo.style.height = 'auto';
        this.productInfo.style.overflow = 'visible';
        
        
        if (this.productName) {
            this.productName.textContent = productInfo.productName || 'Unknown Product';
        }
        if (this.brandName) {
            this.brandName.textContent = productInfo.brandName || 'Unknown Brand';
        }
        if (this.productPrice) {
            this.productPrice.textContent = productInfo.productPrice ? `₹${productInfo.productPrice}` : 'Price not available';
        }
        if (this.productId) {
            this.productId.textContent = productInfo.productId || 'N/A';
        }
        
        
        if (this.productImage) {
            if (productInfo.productImageUrl) {
                
                const proxyUrl = `${this.apiBaseUrl}/api/image-proxy?url=${encodeURIComponent(productInfo.productImageUrl)}`;
                
                
                this.productImage.onload = () => {
                    
                    this.productImage.style.display = 'block';
                    this.productImage.style.border = '1px solid var(--border-color)';
                    this.productImage.style.borderRadius = 'var(--radius-md)';
                    this.productImage.style.backgroundColor = 'var(--bg-primary)';
                    this.productImage.style.padding = '0.5rem';
                    this.productImage.style.objectFit = 'contain';
                };
                
                this.productImage.onerror = () => {
                    
                    this.productImage.style.display = 'flex';
                    this.productImage.style.alignItems = 'center';
                    this.productImage.style.justifyContent = 'center';
                    this.productImage.style.border = '2px dashed var(--border-color)';
                    this.productImage.style.borderRadius = 'var(--radius-md)';
                    this.productImage.style.backgroundColor = 'var(--bg-tertiary)';
                    this.productImage.style.color = 'var(--text-light)';
                    this.productImage.style.fontSize = '0.875rem';
                    this.productImage.style.textAlign = 'center';
                    this.productImage.style.padding = '1rem';
                    this.productImage.style.minHeight = '120px';
                    this.productImage.alt = 'Product Image Not Available';
                    
                    
                    this.productImage.innerHTML = `
                        <div style="text-align: center;">
                            <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: var(--text-light);"></i>
                            <div style="font-size: 0.75rem;">Image not available</div>
                        </div>
                    `;
                };
                
                
                this.productImage.src = proxyUrl;
                this.productImage.alt = productInfo.productName || 'Product Image';
            } else {
                this.productImage.style.display = 'none';
            }
        }
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.shortUrlInput.value);
            this.showToast('URL copied to clipboard!', 'success');
            
            
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
            this.copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
                this.copyBtn.style.background = '';
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy URL', 'error');
        }
    }

    openStatsPage() {
        
        window.open(this.statsUrlInput.value, '_blank');
    }

    selectStatsUrl() {
        
        this.statsUrlInput.select();
        this.statsUrlInput.setSelectionRange(0, 99999); 
    }

    setSubmitButtonState(state) {
        switch (state) {
            case 'loading':
                this.btnText.textContent = 'Shortening...';
                this.btnIcon.className = 'fas fa-spinner fa-spin';
                this.submitBtn.disabled = true;
                break;
            case 'copy':
                this.btnText.textContent = 'Copy';
                this.btnIcon.className = 'fas fa-copy';
                this.submitBtn.disabled = false;
                break;
            case 'default':
            default:
                this.btnText.textContent = 'Shorten';
                this.btnIcon.className = 'fas fa-arrow-right';
                this.submitBtn.disabled = false;
                break;
        }
    }

    resetForm() {
        
        if (this.resultSection && !this.resultSection.classList.contains('hidden')) {
            this.resultSection.classList.add('hidden');
            this.statsLinkSection.classList.add('hidden');
            this.productInfo.classList.add('hidden');
            this.setSubmitButtonState('default');
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        
        
        this.toast.className = `toast ${type}`;
        
        
        const icon = this.toast.querySelector('i');
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                this.toast.style.background = '#10b981';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                this.toast.style.background = '#ef4444';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                this.toast.style.background = '#f59e0b';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                this.toast.style.background = '#6366f1';
        }
        
        
        this.toast.classList.remove('hidden');
        this.toast.classList.add('show');
        
        
        setTimeout(() => {
            this.toast.classList.remove('show');
            setTimeout(() => {
                this.toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    isValidHypdUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.includes('hypd.store');
        } catch {
            return false;
        }
    }
}


class AnalyticsDashboard {
    constructor() {
        this.initializeElements();
        this.startCounterAnimation();
    }

    initializeElements() {
        this.analyticsNumbers = document.querySelectorAll('.analytics-number');
    }

    startCounterAnimation() {
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        this.analyticsNumbers.forEach(number => {
            observer.observe(number);
        });
    }

    animateNumber(element) {
        const target = parseInt(element.textContent) || 0;
        const duration = 2000;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}


function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    
    new URLShortener();
    
    
    new AnalyticsDashboard();
    
    
    initSmoothScrolling();
    
    
    setTimeout(() => {
        const analyticsNumbers = document.querySelectorAll('.analytics-number');
        const demoData = [1250, 890, 156, 45];
        
        analyticsNumbers.forEach((number, index) => {
            if (demoData[index]) {
                number.textContent = demoData[index];
            }
        });
    }, 1000);
});


document.addEventListener('DOMContentLoaded', () => {
    
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});


const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    button {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

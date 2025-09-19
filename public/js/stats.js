class StatsPage {
    constructor() {
        this.apiBaseUrl = window.location.origin;
        this.initializeElements();
        this.bindEvents();
        this.checkForDirectStats();
    }

    initializeElements() {
        
        this.statsForm = document.getElementById('statsForm');
        this.statsUrlInput = document.getElementById('statsUrlInput');
        this.statsSubmitBtn = document.getElementById('statsSubmitBtn');
        
        
        this.statsResults = document.getElementById('statsResults');
        
        
        this.statsShortCode = document.getElementById('statsShortCode');
        this.statsShortUrl = document.getElementById('statsShortUrl');
        this.statsOriginalUrl = document.getElementById('statsOriginalUrl');
        this.statsCreatedAt = document.getElementById('statsCreatedAt');
        
        
        this.statsClickCount = document.getElementById('statsClickCount');
        this.statsFirstClick = document.getElementById('statsFirstClick');
        this.statsLastClick = document.getElementById('statsLastClick');
        this.statsLastAccessed = document.getElementById('statsLastAccessed');
        
        
        this.statsProductCard = document.getElementById('statsProductCard');
        this.statsProductImage = document.getElementById('statsProductImage');
        this.statsProductName = document.getElementById('statsProductName');
        this.statsBrandName = document.getElementById('statsBrandName');
        this.statsProductPrice = document.getElementById('statsProductPrice');
        this.statsProductId = document.getElementById('statsProductId');
        
        
        this.copyOriginalBtn = document.getElementById('copyOriginalBtn');
        this.copyShortBtn = document.getElementById('copyShortBtn');
        this.visitOriginalBtn = document.getElementById('visitOriginalBtn');
        this.visitShortBtn = document.getElementById('visitShortBtn');
        
        
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
    }

    bindEvents() {
        this.statsForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.copyOriginalBtn.addEventListener('click', () => this.copyToClipboard(this.statsOriginalUrl.href, 'Original URL copied!'));
        this.copyShortBtn.addEventListener('click', () => this.copyToClipboard(this.statsShortUrl.href, 'Short URL copied!'));
    }

    checkForDirectStats() {
        
        const pathSegments = window.location.pathname.split('/').filter(segment => segment);
        
        if (pathSegments.length === 2 && pathSegments[0] === 'urlstat') {
            const shortCode = pathSegments[1];
            
            this.statsUrlInput.value = `${this.apiBaseUrl}/${shortCode}`;
            this.handleDirectStats(shortCode);
        }
    }

    async handleDirectStats(shortCode) {
        this.showLoading(true);
        this.statsResults.classList.add('hidden');

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/stats/${shortCode}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch statistics');
            }

            this.displayStats(data);
            this.showToast('Statistics loaded successfully!', 'success');
        } catch (error) {
            console.error('Error fetching stats:', error);
            this.showToast(error.message || 'Failed to load statistics', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const url = this.statsUrlInput.value.trim();
        if (!url) {
            this.showToast('Please enter a URL', 'error');
            return;
        }

        
        const shortCode = this.extractShortCode(url);
        if (!shortCode) {
            this.showToast('Invalid shortened URL format', 'error');
            return;
        }

        this.showLoading(true);
        this.statsResults.classList.add('hidden');

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/stats/${shortCode}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch statistics');
            }

            this.displayStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            this.showToast(error.message || 'Failed to load statistics', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    extractShortCode(url) {
        try {
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split('/').filter(segment => segment);
            
            
            
            
            if (pathSegments.length === 1) {
                return pathSegments[0];
            } else if (pathSegments.length === 2 && pathSegments[0] === 'urlstat') {
                return pathSegments[1];
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    displayStats(data) {
        this.statsResults.classList.remove('hidden');

        
        this.statsShortCode.textContent = data.shortCode;
        this.statsShortUrl.href = data.shortUrl;
        this.statsShortUrl.textContent = data.shortUrl;
        this.statsOriginalUrl.href = data.originalUrl;
        this.statsOriginalUrl.textContent = data.originalUrl;
        this.statsCreatedAt.textContent = this.formatDate(data.createdAt);

        
        this.statsClickCount.textContent = data.clickCount;
        this.statsFirstClick.textContent = data.firstClick ? this.formatDate(data.firstClick) : 'N/A';
        this.statsLastClick.textContent = data.lastClick ? this.formatDate(data.lastClick) : 'N/A';
        this.statsLastAccessed.textContent = data.lastAccessed ? this.formatDate(data.lastAccessed) : 'N/A';

        
        if (data.productInfo) {
            this.statsProductCard.classList.remove('hidden');
            const productInfo = data.productInfo;

            
            if (productInfo.productImageUrl) {
                const proxyUrl = `${this.apiBaseUrl}/api/image-proxy?url=${encodeURIComponent(productInfo.productImageUrl)}`;
                
                this.statsProductImage.onload = () => {
                    this.statsProductImage.style.display = 'block';
                    this.statsProductImage.style.border = '1px solid var(--border-color)';
                    this.statsProductImage.style.borderRadius = 'var(--radius-md)';
                    this.statsProductImage.style.backgroundColor = 'var(--bg-primary)';
                    this.statsProductImage.style.padding = '0.5rem';
                    this.statsProductImage.style.objectFit = 'contain';
                };

                this.statsProductImage.onerror = () => {
                    this.statsProductImage.style.display = 'flex';
                    this.statsProductImage.style.alignItems = 'center';
                    this.statsProductImage.style.justifyContent = 'center';
                    this.statsProductImage.style.border = '2px dashed var(--border-color)';
                    this.statsProductImage.style.borderRadius = 'var(--radius-md)';
                    this.statsProductImage.style.backgroundColor = 'var(--bg-tertiary)';
                    this.statsProductImage.style.color = 'var(--text-light)';
                    this.statsProductImage.style.fontSize = '0.875rem';
                    this.statsProductImage.style.textAlign = 'center';
                    this.statsProductImage.style.padding = '1rem';
                    this.statsProductImage.style.minHeight = '120px';
                    this.statsProductImage.alt = 'Product Image Not Available';
                    this.statsProductImage.innerHTML = `
                        <div style="text-align: center;">
                            <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: var(--text-light);"></i>
                            <div style="font-size: 0.75rem;">Image not available</div>
                        </div>
                    `;
                };

                this.statsProductImage.src = proxyUrl;
                this.statsProductImage.alt = productInfo.productName || 'Product Image';
            } else {
                this.statsProductImage.style.display = 'none';
            }

            this.statsProductName.textContent = productInfo.productName || 'Unknown Product';
            this.statsBrandName.textContent = productInfo.brandName || 'Unknown Brand';
            this.statsProductPrice.textContent = productInfo.productPrice ? `₹${productInfo.productPrice}` : 'Price not available';
            this.statsProductId.textContent = productInfo.productId || 'N/A';
        } else {
            this.statsProductCard.classList.add('hidden');
        }

        
        this.visitOriginalBtn.href = data.originalUrl;
        this.visitShortBtn.href = data.shortUrl;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        };
        return new Date(dateString).toLocaleString(undefined, options);
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    async copyToClipboard(text, successMessage) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast(successMessage, 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy URL', 'error');
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
}


document.addEventListener('DOMContentLoaded', () => {
    new StatsPage();
});
// Utility functions and constants

// GitHub API configuration
const GITHUB_API_CONFIG = {
  BASE_URL: 'https://api.github.com',
  RATE_LIMIT: 60, // requests per hour for unauthenticated requests
  TIMEOUT: 10000, // 10 seconds
};

// Language flag mappings
const LANGUAGE_FLAGS = {
  'JavaScript': '🇯🇸',
  'Python': '🇵🇾',
  'TypeScript': '🇹🇸',
  'Java': '🇯🇲',
  'C++': '🇨🇵',
  'C#': '🇨🇭',
  'PHP': '🇵🇭',
  'Go': '🇬🇴',
  'Rust': '🇷🇺',
  'Swift': '🇸🇪',
  'Kotlin': '🇰🇷',
  'Ruby': '🇷🇺',
  'Scala': '🇸🇨',
  'Dart': '🇩🇰',
  'R': '🇷🇺',
  'MATLAB': '🇲🇦',
  'Shell': '🇸🇭',
  'HTML': '🇭🇹',
  'CSS': '🇨🇸',
  'Vue': '🇻🇺',
  'React': '🇷🇪',
  'Angular': '🇦🇴',
  'Svelte': '🇸🇻',
  'Solid': '🇸🇴',
  'Elixir': '🇪🇨',
  'Clojure': '🇨🇱',
  'Haskell': '🇭🇰',
  'F#': '🇫🇷',
  'OCaml': '🇴🇲',
  'Erlang': '🇪🇷',
  'Lua': '🇱🇺',
  'Perl': '🇵🇪',
  'Assembly': '🇦🇸',
  'C': '🇨🇭',
  'Objective-C': '🇴🇧',
  'PowerShell': '🇵🇼',
  'Groovy': '🇬🇷',
  'Julia': '🇯🇴',
  'Nim': '🇳🇮',
  'Crystal': '🇨🇷',
  'Zig': '🇿🇼',
  'V': '🇻🇳',
  'Carbon': '🇨🇦',
  'Mojo': '🇲🇴',
  'Ballerina': '🇧🇦',
  'Pony': '🇵🇴',
  'Vale': '🇻🇦',
  'Haxe': '🇭🇦'
};

// Activity level thresholds
const ACTIVITY_THRESHOLDS = {
  HIGH: 7, // days
  MEDIUM: 30, // days
};

// Repository variety queries for discovery
const VARIETY_QUERIES = [
  'stars:>10000',
  'stars:>1000',
  'created:>2023-01-01',
  'pushed:>2024-01-01',
  'topic:web',
  'topic:ai',
  'topic:cli',
  'topic:game',
  'topic:python',
  'topic:react',
  'topic:nodejs',
  'topic:api',
  'topic:tool',
  'topic:app',
  'topic:fun',
  'topic:learning',
  'topic:starter',
  'topic:template',
  'topic:demo',
  'topic:portfolio',
  'topic:github',
  'topic:automation',
  'topic:security',
  'topic:docker',
  'topic:typescript',
  'topic:javascript',
  'topic:go',
  'topic:rust',
  'topic:java',
  'topic:mobile',
  'topic:android',
  'topic:ios',
  'topic:design',
  'topic:ui',
  'topic:ux',
  'topic:server',
  'topic:cloud',
  'topic:database',
  'topic:machine-learning',
  'topic:data',
  'topic:visualization',
  'topic:testing',
  'topic:devops',
  'topic:infra',
  'topic:network',
  'topic:hardware',
  'topic:robotics',
  'topic:arduino',
  'topic:raspberry-pi',
  'topic:education',
  'topic:science',
  'topic:math',
  'topic:finance',
  'topic:crypto',
  'topic:blockchain',
  'topic:opensource',
  'topic:community',
  'topic:beginner',
  'topic:advanced',
  'topic:productivity',
  'topic:workflow',
  'topic:integration',
  'topic:monitoring',
  'topic:logging',
  'topic:analytics',
  'topic:search',
  'topic:recommendation',
  'topic:personal',
  'topic:blog',
  'topic:website',
  'topic:cms',
  'topic:static-site',
  'topic:generator',
  'topic:framework',
  'topic:library',
  'topic:plugin',
  'topic:extension',
  'topic:theme',
  'topic:example',
  'topic:sample',
  'topic:showcase',
  'topic:collection',
  'topic:curated',
  'topic:awesome',
  'topic:list',
  'topic:resources',
  'topic:tools',
  'topic:utilities',
  'topic:scripts',
  'topic:snippets',
  'topic:boilerplate',
];

// Sort options for GitHub API
const SORT_OPTIONS = [
  'stars',
  'updated',
  'created',
  'forks',
  'help-wanted-issues',
  'best-match',
];

// Utility functions
class Utils {
  // Format number with commas
  static formatNumber(num) {
    return num?.toLocaleString() || 'N/A';
  }

  // Get language flag emoji
  static getLanguageFlag(language) {
    return LANGUAGE_FLAGS[language] || '🌐';
  }

  // Calculate activity level based on last update
  static getActivityLevel(repo) {
    const now = new Date();
    const updated = new Date(repo.updated_at);
    const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < ACTIVITY_THRESHOLDS.HIGH) return 'high';
    if (daysSinceUpdate < ACTIVITY_THRESHOLDS.MEDIUM) return 'medium';
    return 'low';
  }

  // Debounce function to limit rapid calls
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function to limit function calls
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Safe JSON parsing
  static safeJSONParse(str, defaultValue = {}) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.warn('Failed to parse JSON:', e);
      return defaultValue;
    }
  }

  // Generate random query from variety queries
  static getRandomQuery() {
    return VARIETY_QUERIES[Math.floor(Math.random() * VARIETY_QUERIES.length)];
  }

  // Generate random sort option
  static getRandomSort() {
    return SORT_OPTIONS[Math.floor(Math.random() * SORT_OPTIONS.length)];
  }

  // Format date for display
  static formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }

  // Truncate text to specified length
  static truncateText(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // Validate GitHub repository URL
  static isValidGitHubUrl(url) {
    return /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/.test(url);
  }

  // Extract repository name from GitHub URL
  static extractRepoName(url) {
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
  }

  // Create a deep copy of an object
  static deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Check if object is empty
  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  // Generate unique ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Calculate percentage
  static calculatePercentage(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  }

  // Sleep function for async operations
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry function for failed operations
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await this.sleep(delay * attempt);
      }
    }
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sanitize HTML to prevent XSS
  static sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Escape HTML entities
  static escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Get device type
  static getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Check if element is in viewport
  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Smooth scroll to element
  static smoothScrollTo(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  // Copy text to clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  }

  // Download file
  static downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Get file extension from filename
  static getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Check if file is image
  static isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = this.getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
  }

  // Preload image
  static preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Get image dimensions
  static getImageDimensions(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Utils, GITHUB_API_CONFIG, LANGUAGE_FLAGS, VARIETY_QUERIES };
} 
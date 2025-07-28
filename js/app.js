// Main Application Class
class RepoRoll {
  constructor() {
    this.userData = JSON.parse(localStorage.getItem("reporoll_user_data") || "{}");
    if (!this.userData.repos) this.userData.repos = {};
    
    this.repoQueue = [];
    this.isLoading = false;
    this.repoHistory = [];
    this.currentRepoIndex = -1;
    
    this.init();
  }

  init() {
    this.loadDarkModePreference();
    this.setupEventListeners();
    this.preloadRepos().then(() => this.updateArrowVisibility());
  }

  // Data Management
  saveUserData() {
    localStorage.setItem("reporoll_user_data", JSON.stringify(this.userData));
  }

  // User Actions
  likeRepo(repo) {
    this.updateUserPrefs(repo, 'like');
  }

  dislikeRepo(repo) {
    this.updateUserPrefs(repo, 'dislike');
  }

  saveRepo(repo) {
    this.updateUserPrefs(repo, 'save');
  }

  updateUserPrefs(repo, action) {
    this.userData.repos[repo.full_name] = {
      ...this.userData.repos[repo.full_name],
      tags: repo.topics || [],
      action,
      date: Date.now(),
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      forks: repo.forks_count
    };
    this.saveUserData();
    
    // Show success message
    this.showNotification(`Repository ${action === 'like' ? 'liked' : action === 'dislike' ? 'disliked' : 'saved'}!`);
    
    // If liked, update recommendation preferences
    if (action === 'like') {
      this.updateRecommendationPreferences(repo);
    }
    
    // Auto-advance to next repo
    setTimeout(() => this.showNextRepo(), 1000);
  }

  // Smart recommendation algorithm
  updateRecommendationPreferences(repo) {
    if (!this.userData.preferences) this.userData.preferences = { tags: {}, languages: {} };
    
    // Track liked tags
    const tags = repo.topics || [];
    tags.forEach(tag => {
      if (!this.userData.preferences.tags[tag]) this.userData.preferences.tags[tag] = 0;
      this.userData.preferences.tags[tag]++;
    });
    
    // Track liked languages
    if (repo.language) {
      if (!this.userData.preferences.languages[repo.language]) this.userData.preferences.languages[repo.language] = 0;
      this.userData.preferences.languages[repo.language]++;
    }
    
    this.saveUserData();
  }

  // Get user's top preferences
  getUserPreferences() {
    if (!this.userData.preferences) return { tags: [], languages: [] };
    
    const topTags = Object.entries(this.userData.preferences.tags || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    const topLanguages = Object.entries(this.userData.preferences.languages || {})
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang);
    
    return { tags: topTags, languages: topLanguages };
  }

  // API Functions
  async fetchRepos() {
    const preferences = this.getUserPreferences();
    const hasLikes = Object.values(this.userData.repos || {}).some(entry => entry.action === 'like');
    
    let queries = [];
    
    // If user has liked repos, prioritize their preferences
    if (hasLikes && preferences.tags.length > 0) {
      // Add personalized queries based on user preferences
      preferences.tags.forEach(tag => {
        queries.push(`topic:${tag}`);
      });
      preferences.languages.forEach(lang => {
        queries.push(`language:${lang}`);
      });
    }
    
    // Add variety queries
    const varietyQueries = [
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
    
    // Combine personalized and variety queries
    queries = [...queries, ...varietyQueries];
    
    // Randomly select a query, with preference for personalized ones
    const query = queries[Math.floor(Math.random() * queries.length)];
    const sortOptions = [
      'stars',
      'updated',
      'created',
      'forks',
      'help-wanted-issues',
      'best-match',
    ];
    const sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
    const order = Math.random() > 0.5 ? 'desc' : 'asc';
    const page = 1 + Math.floor(Math.random() * 10);
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items;
  }

  async fetchReadmeImage(owner, repo) {
    const branches = ["main", "master"];
    for (const branch of branches) {
      try {
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
        const res = await fetch(url);
        const md = await res.text();
        
        // Find the first image in the README that is locally saved
        const imageMatches = md.matchAll(/!\[[^\]]*\]\((.*?)\)/g);
        
        for (const match of imageMatches) {
          let imageUrl = match[1];
          
          // Only process local images (not external URLs)
          if (!imageUrl.startsWith("http")) {
            // Remove leading ./ or / and construct the full URL
            const cleanPath = imageUrl.replace(/^\.?\//, "");
            imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${cleanPath}`;
            
            // Test if the image URL is accessible
            try {
              const imgRes = await fetch(imageUrl, { method: 'HEAD' });
              if (imgRes.ok) {
                return imageUrl;
              }
            } catch (e) {
              // If this image fails, try the next one
              continue;
            }
          }
        }
      } catch (e) {
        // If README fetch fails, continue to next branch
        continue;
      }
    }
    return null;
  }

  async preloadRepos() {
    if (this.repoQueue.length < 3 && !this.isLoading) {
      this.isLoading = true;
      const repos = await this.fetchRepos();
      for (const repo of repos) {
        const image = await this.fetchReadmeImage(repo.owner.login, repo.name);
        this.repoQueue.push({ repo, image });
      }
      this.isLoading = false;
      // If this is the first load and nothing is shown, show the first repo
      if (document.getElementById('discover').classList.contains('active') && this.currentRepoIndex === -1 && this.repoQueue.length > 0) {
        this.showNextRepo();
      }
      this.updateNavigationArrows();
    }
  }

  // UI Functions
  renderCard({ repo, image }) {
    const content = document.getElementById('discover-content');
    const card = document.createElement('div');
    card.className = 'card';
    
    const activityLevel = this.getActivityLevel(repo);
    const languageFlag = this.getLanguageFlag(repo.language);
    
    card.innerHTML = `
      <div class="card-image">
        ${image ? `<img src="${image}" alt="Repository preview" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
        <div class="placeholder" style="display: ${image ? 'none' : 'flex'}">
          <i class="fas fa-code"></i>
        </div>
      </div>
      <div class="card-content">
        <div class="repo-header">
          <div>
            <div class="repo-title">${repo.full_name}</div>
            <div class="repo-stats">
              <span class="stat">
                <i class="fas fa-star"></i>
                ${repo.stargazers_count?.toLocaleString() || 'N/A'}
              </span>
              <span class="stat">
                <i class="fas fa-code-branch"></i>
                ${repo.forks_count?.toLocaleString() || 'N/A'}
              </span>
              <span class="language-icon">
                <span class="language-flag">${languageFlag}</span>
                ${repo.language || 'Unknown'}
              </span>
              <span class="activity-indicator">
                <div class="activity-dot activity-${activityLevel}"></div>
                ${activityLevel === 'high' ? 'Active' : activityLevel === 'medium' ? 'Moderate' : 'Low'}
              </span>
            </div>
          </div>
        </div>
        <div class="repo-description">
          ${repo.description || 'No description available.'}
        </div>
        ${repo.topics && repo.topics.length > 0 ? `
          <div class="repo-topics">
            ${repo.topics.slice(0, 5).map(topic => `<span class="topic">${topic}</span>`).join('')}
          </div>
        ` : ''}
                    <div class="action-buttons">
              <button class="btn btn-like" onclick="app.likeRepo(${JSON.stringify(repo).replace(/"/g, '&quot;')})">
                <i class="fas fa-heart"></i> Like
              </button>
              <button class="btn btn-dislike" onclick="app.dislikeRepo(${JSON.stringify(repo).replace(/"/g, '&quot;')})">
                <i class="fas fa-thumbs-down"></i> Dislike
              </button>
              <button class="btn btn-save" onclick="app.saveRepo(${JSON.stringify(repo).replace(/"/g, '&quot;')})">
                <i class="fas fa-bookmark"></i> Save
              </button>
              <button class="btn btn-collection" onclick="app.showCollectionModal('${repo.full_name}', ${JSON.stringify(repo).replace(/"/g, '&quot;')})">
                <i class="fas fa-folder-plus"></i> Add to Collection
              </button>
              <button class="btn btn-gh" onclick="window.open('${repo.html_url}', '_blank')">
                <i class="fab fa-github"></i> View on GitHub
              </button>
              <button class="share-btn" onclick="app.shareRepo('${repo.full_name}', '${repo.html_url}')">
                <i class="fas fa-share-alt"></i> Share
              </button>
            </div>
      </div>
    `;
    
    // Clear existing content and add new card
    content.innerHTML = '';
    content.appendChild(card);
  }

  getLanguageFlag(language) {
    const flags = {
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
    return flags[language] || '🌐';
  }

  getActivityLevel(repo) {
    const now = new Date();
    const updated = new Date(repo.updated_at);
    const daysSinceUpdate = (now - updated) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 7) return 'high';
    if (daysSinceUpdate < 30) return 'medium';
    return 'low';
  }

  // Navigation
  showNextRepo() {
    if (this.repoQueue.length > 0) {
      const next = this.repoQueue.shift();
      this.currentRepoIndex++;
      this.repoHistory.push(next);
      this.renderCard(next);
      this.updateNavigationArrows();
      this.preloadRepos();
    } else {
      document.getElementById('discover-content').innerHTML = `
        <div class="loading-container">
          <div class="loading-animation">
            <div class="loading-cube"></div>
            <div class="loading-cube"></div>
            <div class="loading-cube"></div>
            <div class="loading-cube"></div>
          </div>
          <div class="loading-text">Loading more repositories</div>
          <div class="loading-dots">●</div>
          <div class="loading-dots">●</div>
          <div class="loading-dots">●</div>
        </div>
      `;
      this.preloadRepos().then(() => this.showNextRepo());
    }
  }

  showPreviousRepo() {
    if (this.currentRepoIndex > 0) {
      this.currentRepoIndex--;
      const previousRepo = this.repoHistory[this.currentRepoIndex];
      this.renderCard(previousRepo);
      this.updateNavigationArrows();
    }
  }

  updateNavigationArrows() {
    const upArrow = document.getElementById('arrow-up');
    const downArrow = document.getElementById('arrow-down');
    
    if (upArrow) upArrow.disabled = this.currentRepoIndex <= 0;
    if (downArrow) downArrow.disabled = (!this.isLoading && this.repoQueue.length === 0 && this.currentRepoIndex >= this.repoHistory.length - 1);
  }

  updateArrowVisibility() {
    const navArrows = document.getElementById('nav-arrows');
    if (document.getElementById('discover').classList.contains('active')) {
      navArrows.classList.add('active');
    } else {
      navArrows.classList.remove('active');
    }
  }

  // Notifications
  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Share functionality
  shareRepo(name, url) {
    if (navigator.share) {
      navigator.share({
        title: `Check out this awesome repository: ${name}`,
        text: `I found this amazing repository on RepoRoll: ${name}`,
        url: url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${name}: ${url}`);
      this.showNotification('Repository link copied to clipboard!');
    }
  }

  // Dark mode functionality
  toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
      body.classList.remove('dark-mode');
      localStorage.setItem('reporoll_dark_mode', 'false');
      document.querySelector('.settings-btn i').className = 'fas fa-moon';
    } else {
      body.classList.add('dark-mode');
      localStorage.setItem('reporoll_dark_mode', 'true');
      document.querySelector('.settings-btn i').className = 'fas fa-sun';
    }
  }

  loadDarkModePreference() {
    const darkMode = localStorage.getItem('reporoll_dark_mode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.querySelector('.settings-btn i').className = 'fas fa-sun';
    }
  }

  // Collection functionality
  showCollectionModal(repoName, repo) {
    const collections = this.userData.collections || {};
    const collectionNames = Object.keys(collections);
    
    if (collectionNames.length === 0) {
      this.showNotification('No collections found. Create a collection first!');
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'collection-modal';
    modal.innerHTML = `
      <div class="collection-modal-content">
        <div class="collection-modal-header">
          <h3>Add "${repoName}" to Collection</h3>
          <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="collection-modal-body">
          <p>Select a collection to add this repository:</p>
          <div class="collection-list">
            ${collectionNames.map(name => `
              <div class="collection-item" onclick="app.addToCollection('${name}', '${repoName}', ${JSON.stringify(repo).replace(/"/g, '&quot;')})">
                <i class="fas fa-folder"></i>
                <span>${name}</span>
                <span class="collection-count">${collections[name].length} repos</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="collection-modal-footer">
          <button class="btn btn-save" onclick="app.createNewCollectionFromModal()">
            <i class="fas fa-plus"></i> Create New Collection
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  addToCollection(collectionName, repoName, repo) {
    if (!this.userData.collections) this.userData.collections = {};
    if (!this.userData.collections[collectionName]) this.userData.collections[collectionName] = [];
    
    // Check if repo is already in collection
    const existingIndex = this.userData.collections[collectionName].findIndex(r => r.name === repoName);
    if (existingIndex !== -1) {
      this.showNotification('Repository is already in this collection!');
      return;
    }
    
    // Add repo to collection
    this.userData.collections[collectionName].push({
      name: repoName,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      date: Date.now()
    });
    
    this.saveUserData();
    this.showNotification(`Added to "${collectionName}" collection!`);
    
    // Close modal
    const modal = document.querySelector('.collection-modal');
    if (modal) modal.remove();
  }

  createNewCollectionFromModal() {
    const name = prompt('Enter collection name:');
    if (name && name.trim()) {
      if (!this.userData.collections) this.userData.collections = {};
      this.userData.collections[name.trim()] = [];
      this.saveUserData();
      this.showNotification('Collection created!');
      
      // Refresh the modal with new collection
      const modal = document.querySelector('.collection-modal');
      if (modal) {
        modal.remove();
        // Re-open modal with new collection
        setTimeout(() => {
          const repoName = modal.querySelector('h3').textContent.match(/"([^"]+)"/)[1];
          const repo = JSON.parse(modal.querySelector('.collection-item').getAttribute('onclick').match(/JSON\.parse\('(.+?)'\)/)[1]);
          this.showCollectionModal(repoName, repo);
        }, 100);
      }
    }
  }

  // Event Listeners
  setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (document.getElementById('discover').classList.contains('active')) {
          this.showNextRepo();
        }
      }
    });
  }
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new RepoRoll();
}); 
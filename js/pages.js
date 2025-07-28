// Page-specific functionality
class PageManager {
  constructor(app) {
    this.app = app;
  }

  // Page navigation
  showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Load page content
    switch(pageName) {
      case 'discover':
        if (this.app.repoQueue.length === 0) {
          this.app.preloadRepos().then(() => this.app.showNextRepo());
        } else {
          this.app.showNextRepo();
        }
        break;
      case 'liked':
        this.renderLikedRepos();
        break;
      case 'saved':
        this.renderSavedRepos();
        break;
      case 'stats':
        this.renderStats();
        break;
      case 'collections':
        this.renderCollections();
        break;
    }
    this.app.updateArrowVisibility();
  }

  // Render liked repositories
  renderLikedRepos() {
    const content = document.getElementById('liked-content');
    const likedRepos = Object.entries(this.app.userData.repos || {}).filter(([name, entry]) => entry.action === 'like');
    
    if (likedRepos.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-heart"></i>
          <h3>No liked repositories yet</h3>
          <p>Start discovering and liking repositories to see them here!</p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="liked-repos">
        ${likedRepos.map(([name, entry]) => `
          <div class="liked-repo-card">
            <div class="liked-repo-image">
              <i class="fas fa-code"></i>
            </div>
            <div class="liked-repo-content">
              <div class="liked-repo-title">${name}</div>
              <div class="liked-repo-date">
                Liked on ${new Date(entry.date).toLocaleDateString()}
              </div>
              ${entry.description ? `<p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${entry.description}</p>` : ''}
              <div style="margin-top: 1rem;">
                <button class="btn btn-gh" onclick="window.open('https://github.com/${name}', '_blank')" style="font-size: 0.8rem; padding: 8px 16px;">
                  <i class="fab fa-github"></i> View
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render saved repositories
  renderSavedRepos() {
    const content = document.getElementById('saved-content');
    const savedRepos = Object.entries(this.app.userData.repos || {}).filter(([name, entry]) => entry.action === 'save');
    
    if (savedRepos.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-bookmark"></i>
          <h3>No saved repositories yet</h3>
          <p>Save interesting repositories to view them here later!</p>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="liked-repos">
        ${savedRepos.map(([name, entry]) => `
          <div class="liked-repo-card">
            <div class="liked-repo-image">
              <i class="fas fa-code"></i>
            </div>
            <div class="liked-repo-content">
              <div class="liked-repo-title">${name}</div>
              <div class="liked-repo-date">
                Saved on ${new Date(entry.date).toLocaleDateString()}
              </div>
              ${entry.description ? `<p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${entry.description}</p>` : ''}
              <div style="margin-top: 1rem;">
                <button class="btn btn-gh" onclick="window.open('https://github.com/${name}', '_blank')" style="font-size: 0.8rem; padding: 8px 16px;">
                  <i class="fab fa-github"></i> View
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Render statistics
  renderStats() {
    const content = document.getElementById('stats-content');
    const repos = this.app.userData.repos || {};
    const likedCount = Object.values(repos).filter(entry => entry.action === 'like').length;
    const savedCount = Object.values(repos).filter(entry => entry.action === 'save').length;
    const dislikedCount = Object.values(repos).filter(entry => entry.action === 'dislike').length;
    const totalInteractions = Object.keys(repos).length;

    const languageStats = this.trackLanguageEvolution();
    const topLanguages = Object.entries(languageStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5);

    content.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${totalInteractions}</div>
          <div class="stat-label">Total Interactions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${likedCount}</div>
          <div class="stat-label">Liked Repositories</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${savedCount}</div>
          <div class="stat-label">Saved Repositories</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${dislikedCount}</div>
          <div class="stat-label">Disliked Repositories</div>
        </div>
      </div>
      
      ${topLanguages.length > 0 ? `
        <div class="evolution-chart">
          <h3 style="margin-bottom: 1.5rem; color: #333; text-align: center;">Language Evolution</h3>
          <div style="margin-bottom: 2rem;">
            ${topLanguages.map(([lang, stats]) => {
              const percentage = (stats.count / totalInteractions * 100).toFixed(1);
              return `
                <div style="margin-bottom: 1rem;">
                  <div class="chart-label">
                    <span>${this.app.getLanguageFlag(lang)} ${lang}</span>
                    <span>${stats.count} repos (${percentage}%)</span>
                  </div>
                  <div class="chart-bar" style="width: ${percentage}%;"></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  // Language evolution tracking
  trackLanguageEvolution() {
    const repos = this.app.userData.repos || {};
    const languageStats = {};
    
    Object.values(repos).forEach(entry => {
      if (entry.language) {
        if (!languageStats[entry.language]) {
          languageStats[entry.language] = { count: 0, dates: [] };
        }
        languageStats[entry.language].count++;
        languageStats[entry.language].dates.push(entry.date);
      }
    });
    
    return languageStats;
  }

  // Render collections
  renderCollections() {
    const content = document.getElementById('collections-content');
    const collections = this.app.userData.collections || {};
    
    if (Object.keys(collections).length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-folder"></i>
          <h3>No collections yet</h3>
          <p>Create collections to organize your favorite repositories!</p>
          <button class="btn btn-save" onclick="pageManager.createNewCollection()" style="margin-top: 1rem;">
            <i class="fas fa-plus"></i> Create Collection
          </button>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="collections-container">
        ${Object.entries(collections).map(([name, repos]) => `
          <div class="collection-card" onclick="pageManager.viewCollection('${name}')">
            <div class="collection-header">
              <div class="collection-title">${name}</div>
              <div class="collection-count">${repos.length} repos</div>
            </div>
            <div style="color: #666; font-size: 0.9rem;">
              ${repos.slice(0, 3).map(repo => repo.name).join(', ')}
              ${repos.length > 3 ? ` and ${repos.length - 3} more...` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="text-align: center; margin-top: 2rem;">
        <button class="btn btn-save" onclick="pageManager.createNewCollection()">
          <i class="fas fa-plus"></i> Create New Collection
        </button>
      </div>
    `;
  }

  // Create new collection
  createNewCollection() {
    const name = prompt('Enter collection name:');
    if (name && name.trim()) {
      if (!this.app.userData.collections) this.app.userData.collections = {};
      this.app.userData.collections[name.trim()] = [];
      this.app.saveUserData();
      this.renderCollections();
      this.app.showNotification('Collection created!');
    }
  }

  // View collection
  viewCollection(name) {
    const collections = this.app.userData.collections || {};
    const collection = collections[name];
    
    if (!collection) {
      this.app.showNotification('Collection not found!');
      return;
    }
    
    const content = document.getElementById('collections-content');
    content.innerHTML = `
      <div class="collection-detail-header">
        <button class="btn btn-gh" onclick="pageManager.renderCollections()" style="margin-bottom: 1rem;">
          <i class="fas fa-arrow-left"></i> Back to Collections
        </button>
        <h2>${name}</h2>
        <p>${collection.length} repositories</p>
      </div>
      ${collection.length === 0 ? `
        <div class="empty-state">
          <i class="fas fa-folder-open"></i>
          <h3>No repositories in this collection</h3>
          <p>Add repositories from the Discover page to see them here!</p>
        </div>
      ` : `
        <div class="liked-repos">
          ${collection.map(repo => `
            <div class="liked-repo-card">
              <div class="liked-repo-image">
                <i class="fas fa-code"></i>
              </div>
              <div class="liked-repo-content">
                <div class="liked-repo-title">${repo.name}</div>
                <div class="liked-repo-date">
                  Added on ${new Date(repo.date).toLocaleDateString()}
                </div>
                ${repo.description ? `<p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">${repo.description}</p>` : ''}
                <div style="margin-top: 1rem; display: flex; gap: 10px;">
                  <button class="btn btn-gh" onclick="window.open('${repo.url}', '_blank')" style="font-size: 0.8rem; padding: 8px 16px;">
                    <i class="fab fa-github"></i> View
                  </button>
                  <button class="btn btn-dislike" onclick="pageManager.removeFromCollection('${name}', '${repo.name}')" style="font-size: 0.8rem; padding: 8px 16px;">
                    <i class="fas fa-trash"></i> Remove
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  }

  // Remove repository from collection
  removeFromCollection(collectionName, repoName) {
    const collections = this.app.userData.collections || {};
    const collection = collections[collectionName];
    
    if (!collection) {
      this.app.showNotification('Collection not found!');
      return;
    }
    
    const index = collection.findIndex(repo => repo.name === repoName);
    if (index === -1) {
      this.app.showNotification('Repository not found in collection!');
      return;
    }
    
    collection.splice(index, 1);
    this.app.saveUserData();
    this.app.showNotification('Repository removed from collection!');
    
    // Refresh the collection view
    this.viewCollection(collectionName);
  }
}

// Initialize page manager
let pageManager;
document.addEventListener('DOMContentLoaded', () => {
  pageManager = new PageManager(app);
}); 
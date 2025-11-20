// Authentication JavaScript for SMAN 1 Parengan Website

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.init();
    }

    init() {
        // Check if user is logged in
        this.checkAuthStatus();
        
        // Initialize event listeners
        this.initEventListeners();
    }

    // Check authentication status
    checkAuthStatus() {
        const token = localStorage.getItem('sman1_token');
        const user = localStorage.getItem('sman1_user');
        
        if (token && user) {
            this.token = token;
            this.currentUser = JSON.parse(user);
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForLoggedOutUser();
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout functionality
        const logoutButtons = document.querySelectorAll('.logout-btn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleLogout(e));
        });

        // Role selection
        const roleOptions = document.querySelectorAll('.role-option');
        roleOptions.forEach(option => {
            option.addEventListener('click', (e) => this.selectRole(e));
        });
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.querySelector('.role-option.active')?.dataset.role;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        if (!username || !password || !role) {
            this.showMessage('Harap isi semua field dengan benar.', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Simulate API call - replace with actual API endpoint
            const userData = await this.authenticateUser(username, password, role);
            
            if (userData) {
                this.loginSuccess(userData, rememberMe);
            } else {
                this.showMessage('Username atau password salah.', 'error');
            }
        } catch (error) {
            this.showMessage('Terjadi kesalahan saat login. Silakan coba lagi.', 'error');
            console.error('Login error:', error);
        } finally {
            this.setLoadingState(false);
        }
    }

    // Simulate authentication - replace with actual API call
    async authenticateUser(username, password, role) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock user data - in real application, this would be an API call
        const users = {
            siswa: [
                { username: '20210001', password: 'siswa123', name: 'Ahmad Fauzi', nis: '20210001', kelas: 'XII IPA 1' },
                { username: '20210012', password: 'siswa123', name: 'Siti Rahma', nis: '20210012', kelas: 'XII IPA 1' }
            ],
            guru: [
                { username: 'guru001', password: 'guru123', name: 'Diana Sari, S.Pd.', nip: '198504152006042001', mataPelajaran: 'Matematika' },
                { username: 'guru002', password: 'guru123', name: 'Budi Santoso, S.Pd.', nip: '197805102005011002', mataPelajaran: 'Fisika' }
            ],
            admin: [
                { username: 'admin', password: 'admin123', name: 'Administrator', role: 'Super Admin' }
            ]
        };

        const user = users[role]?.find(u => u.username === username && u.password === password);
        
        if (user) {
            return {
                ...user,
                role: role,
                token: this.generateToken()
            };
        }

        return null;
    }

    // Generate mock token
    generateToken() {
        return 'sman1_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    // Handle successful login
    loginSuccess(userData, rememberMe) {
        this.currentUser = userData;
        this.token = userData.token;

        // Store in localStorage
        if (rememberMe) {
            localStorage.setItem('sman1_token', this.token);
            localStorage.setItem('sman1_user', JSON.stringify(this.currentUser));
        } else {
            sessionStorage.setItem('sman1_token', this.token);
            sessionStorage.setItem('sman1_user', JSON.stringify(this.currentUser));
        }

        this.showMessage(`Login berhasil! Selamat datang ${userData.name}`, 'success');

        // Redirect based on role
        setTimeout(() => {
            this.redirectToDashboard(userData.role);
        }, 1000);
    }

    // Redirect to appropriate dashboard
    redirectToDashboard(role) {
        const dashboards = {
            siswa: '../dashboard/siswa.html',
            guru: '../dashboard/guru.html',
            admin: '../dashboard/admin.html'
        };

        window.location.href = dashboards[role] || '../index.html';
    }

    // Handle logout
    handleLogout(e) {
        e.preventDefault();
        
        if (confirm('Apakah Anda yakin ingin logout?')) {
            this.logout();
        }
    }

    // Perform logout
    logout() {
        // Clear storage
        localStorage.removeItem('sman1_token');
        localStorage.removeItem('sman1_user');
        sessionStorage.removeItem('sman1_token');
        sessionStorage.removeItem('sman1_user');

        // Reset state
        this.currentUser = null;
        this.token = null;

        // Update UI
        this.updateUIForLoggedOutUser();

        // Redirect to home
        window.location.href = '../index.html';
    }

    // Select role in login form
    selectRole(e) {
        const roleOptions = document.querySelectorAll('.role-option');
        roleOptions.forEach(option => option.classList.remove('active'));
        
        e.currentTarget.classList.add('active');
        
        // Update form labels based on role
        this.updateFormLabels(e.currentTarget.dataset.role);
    }

    // Update form labels based on selected role
    updateFormLabels(role) {
        const usernameLabel = document.querySelector('label[for="username"]');
        const usernameInput = document.getElementById('username');
        
        if (usernameLabel && usernameInput) {
            switch(role) {
                case 'siswa':
                    usernameLabel.textContent = 'NIS';
                    usernameInput.placeholder = 'Masukkan NIS';
                    break;
                case 'guru':
                    usernameLabel.textContent = 'Username / NIP';
                    usernameInput.placeholder = 'Masukkan username atau NIP';
                    break;
                case 'admin':
                    usernameLabel.textContent = 'Username';
                    usernameInput.placeholder = 'Masukkan username admin';
                    break;
            }
        }
    }

    // Update UI for logged in user
    updateUIForLoggedInUser() {
        // Update navigation
        const loginLinks = document.querySelectorAll('.login-link');
        const userMenus = document.querySelectorAll('.user-menu');
        
        loginLinks.forEach(link => link.style.display = 'none');
        userMenus.forEach(menu => {
            menu.style.display = 'block';
            
            // Update user info in menu
            const userNameElement = menu.querySelector('.user-name');
            if (userNameElement && this.currentUser) {
                userNameElement.textContent = this.currentUser.name;
            }
        });

        // Update dashboard if on dashboard page
        if (window.location.pathname.includes('dashboard')) {
            this.updateDashboardUserInfo();
        }
    }

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        const loginLinks = document.querySelectorAll('.login-link');
        const userMenus = document.querySelectorAll('.user-menu');
        
        loginLinks.forEach(link => link.style.display = 'block');
        userMenus.forEach(menu => menu.style.display = 'none');
    }

    // Update user info on dashboard
    updateDashboardUserInfo() {
        if (!this.currentUser) return;

        const userInfoElements = {
            '.user-name': this.currentUser.name,
            '.user-role': this.formatRole(this.currentUser.role),
            '.user-id': this.currentUser.nis || this.currentUser.nip || this.currentUser.username,
            '.user-class': this.currentUser.kelas || '',
            '.user-subject': this.currentUser.mataPelajaran || ''
        };

        Object.entries(userInfoElements).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element && value) {
                element.textContent = value;
            }
        });
    }

    // Format role for display
    formatRole(role) {
        const roleMap = {
            siswa: 'Siswa',
            guru: 'Guru',
            admin: 'Administrator'
        };
        return roleMap[role] || role;
    }

    // Set loading state for login form
    setLoadingState(isLoading) {
        const submitButton = document.querySelector('#loginForm button[type="submit"]');
        const inputs = document.querySelectorAll('#loginForm input');
        
        if (submitButton) {
            if (isLoading) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            } else {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Login';
            }
        }
        
        inputs.forEach(input => {
            input.disabled = isLoading;
        });
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type} auth-message alert-dismissible fade show`;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;
        messageElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Add to page
        document.body.appendChild(messageElement);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.isAuthenticated() && this.currentUser.role === role;
    }

    // Get current user data
    getCurrentUser() {
        return this.currentUser;
    }

    // Get authentication token
    getToken() {
        return this.token;
    }
}

// Initialize Auth Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
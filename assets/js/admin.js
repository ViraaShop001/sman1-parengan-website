// Admin Module JavaScript for SMAN 1 Parengan Website

class AdminManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.systemStats = {};
        this.init();
    }

    init() {
        this.loadUserData();
        this.initEventListeners();
        this.loadSystemData();
        this.checkPermissions();
    }

    // Load user data from authentication
    loadUserData() {
        const userData = localStorage.getItem('sman1_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUIWithUserData();
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // User management
        this.initUserManagement();
        
        // System settings
        this.initSystemSettings();
        
        // Data management
        this.initDataManagement();
        
        // Reports
        this.initReports();
    }

    // Initialize user management functionality
    initUserManagement() {
        // Add user form
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => this.handleAddUser(e));
        }

        // User search
        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => this.searchUsers(e.target.value));
        }

        // User filters
        const userFilters = document.querySelectorAll('.user-filter');
        userFilters.forEach(filter => {
            filter.addEventListener('change', () => this.filterUsers());
        });

        // Bulk user actions
        const bulkUserBtn = document.getElementById('bulkUserBtn');
        if (bulkUserBtn) {
            bulkUserBtn.addEventListener('click', () => this.handleBulkUserActions());
        }
    }

    // Initialize system settings functionality
    initSystemSettings() {
        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleSaveSettings(e));
        }

        // Backup buttons
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.handleBackup());
        }

        const restoreBtn = document.getElementById('restoreBtn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.handleRestore());
        }
    }

    // Initialize data management functionality
    initDataManagement() {
        // Import data
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.handleImportData());
        }

        // Export data
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExportData());
        }

        // Cleanup data
        const cleanupBtn = document.getElementById('cleanupBtn');
        if (cleanupBtn) {
            cleanupBtn.addEventListener('click', () => this.handleCleanupData());
        }
    }

    // Initialize reports functionality
    initReports() {
        // Generate report
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.handleGenerateReport());
        }

        // Report filters
        const reportFilters = document.querySelectorAll('.report-filter');
        reportFilters.forEach(filter => {
            filter.addEventListener('change', () => this.updateReport());
        });
    }

    // Handle add user
    async handleAddUser(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('userName'),
            email: formData.get('userEmail'),
            username: formData.get('userUsername'),
            password: formData.get('userPassword'),
            role: formData.get('userRole'),
            subject: formData.get('userSubject'),
            class: formData.get('userClass'),
            status: 'active',
            createdBy: this.currentUser.name,
            createdAt: new Date().toISOString()
        };

        try {
            const createdUser = await this.createUser(userData);
            this.showMessage('User berhasil ditambahkan!', 'success');
            e.target.reset();
            
            // Close modal if exists
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            if (modal) modal.hide();
            
            // Refresh user list
            this.loadUsers();
        } catch (error) {
            this.showMessage('Gagal menambah user: ' + error.message, 'error');
        }
    }

    // Create user
    async createUser(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Generate ID based on role
                    if (userData.role === 'siswa') {
                        userData.id = 'siswa_' + Date.now();
                        userData.nis = this.generateNIS();
                    } else if (userData.role === 'guru') {
                        userData.id = 'guru_' + Date.now();
                        userData.nip = this.generateNIP();
                    } else {
                        userData.id = 'admin_' + Date.now();
                    }

                    // Save to localStorage
                    const users = JSON.parse(localStorage.getItem('sman1_users') || '[]');
                    users.push(userData);
                    localStorage.setItem('sman1_users', JSON.stringify(users));
                    
                    resolve(userData);
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });
    }

    // Handle save settings
    async handleSaveSettings(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const settings = {
            schoolName: formData.get('schoolName'),
            schoolAddress: formData.get('schoolAddress'),
            schoolPhone: formData.get('schoolPhone'),
            schoolEmail: formData.get('schoolEmail'),
            academicYear: formData.get('academicYear'),
            semester: formData.get('semester'),
            maxStudents: parseInt(formData.get('maxStudents')),
            gradeScale: formData.get('gradeScale'),
            updatedBy: this.currentUser.name,
            updatedAt: new Date().toISOString()
        };

        try {
            await this.saveSettings(settings);
            this.showMessage('Pengaturan berhasil disimpan!', 'success');
        } catch (error) {
            this.showMessage('Gagal menyimpan pengaturan: ' + error.message, 'error');
        }
    }

    // Save system settings
    async saveSettings(settings) {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem('sman1_settings', JSON.stringify(settings));
                resolve();
            }, 500);
        });
    }

    // Handle backup
    async handleBackup() {
        try {
            const backupData = await this.createBackup();
            this.downloadBackup(backupData);
            this.showMessage('Backup berhasil dibuat!', 'success');
        } catch (error) {
            this.showMessage('Gagal membuat backup: ' + error.message, 'error');
        }
    }

    // Create backup
    async createBackup() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const backupData = {
                    users: JSON.parse(localStorage.getItem('sman1_users') || '[]'),
                    exams: JSON.parse(localStorage.getItem('sman1_exams') || '[]'),
                    questions: JSON.parse(localStorage.getItem('sman1_questions') || '[]'),
                    grades: JSON.parse(localStorage.getItem('sman1_grades') || '[]'),
                    settings: JSON.parse(localStorage.getItem('sman1_settings') || '{}'),
                    backupDate: new Date().toISOString(),
                    backedUpBy: this.currentUser.name
                };
                resolve(JSON.stringify(backupData, null, 2));
            }, 2000);
        });
    }

    // Download backup file
    downloadBackup(backupData) {
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_sman1_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Handle restore
    async handleRestore() {
        const fileInput = document.getElementById('restoreFile');
        if (!fileInput.files.length) {
            this.showMessage('Pilih file backup terlebih dahulu', 'warning');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                await this.restoreBackup(backupData);
                this.showMessage('Restore berhasil!', 'success');
                fileInput.value = '';
            } catch (error) {
                this.showMessage('Gagal restore: File tidak valid', 'error');
            }
        };

        reader.readAsText(file);
    }

    // Restore from backup
    async restoreBackup(backupData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (backupData.users) localStorage.setItem('sman1_users', JSON.stringify(backupData.users));
                if (backupData.exams) localStorage.setItem('sman1_exams', JSON.stringify(backupData.exams));
                if (backupData.questions) localStorage.setItem('sman1_questions', JSON.stringify(backupData.questions));
                if (backupData.grades) localStorage.setItem('sman1_grades', JSON.stringify(backupData.grades));
                if (backupData.settings) localStorage.setItem('sman1_settings', JSON.stringify(backupData.settings));
                resolve();
            }, 2000);
        });
    }

    // Handle import data
    async handleImportData() {
        // Implementation for importing data from Excel/CSV
        this.showMessage('Fitur import data akan segera tersedia', 'info');
    }

    // Handle export data
    async handleExportData() {
        try {
            const exportData = await this.prepareExportData();
            this.downloadExportData(exportData);
            this.showMessage('Data berhasil diexport!', 'success');
        } catch (error) {
            this.showMessage('Gagal export data: ' + error.message, 'error');
        }
    }

    // Prepare data for export
    async prepareExportData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = {
                    students: this.getStudentsData(),
                    teachers: this.getTeachersData(),
                    grades: this.getGradesData(),
                    exportDate: new Date().toISOString(),
                    exportedBy: this.currentUser.name
                };
                resolve(data);
            }, 1000);
        });
    }

    // Download export data
    downloadExportData(exportData) {
        const csvContent = this.convertToCSV(exportData);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_data_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Handle cleanup data
    async handleCleanupData() {
        const confirmed = confirm('Apakah Anda yakin ingin membersihkan data? Tindakan ini tidak dapat dibatalkan.');
        if (!confirmed) return;

        try {
            await this.cleanupOldData();
            this.showMessage('Data berhasil dibersihkan!', 'success');
        } catch (error) {
            this.showMessage('Gagal membersihkan data: ' + error.message, 'error');
        }
    }

    // Cleanup old data
    async cleanupOldData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Example: Remove data older than 1 year
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

                // Cleanup exams
                const exams = JSON.parse(localStorage.getItem('sman1_exams') || '[]');
                const filteredExams = exams.filter(exam => new Date(exam.createdAt) > oneYearAgo);
                localStorage.setItem('sman1_exams', JSON.stringify(filteredExams));

                // Cleanup grades (keep only current academic year)
                const currentYear = new Date().getFullYear();
                const grades = JSON.parse(localStorage.getItem('sman1_grades') || '[]');
                const filteredGrades = grades.filter(grade => {
                    const gradeYear = new Date(grade.createdAt).getFullYear();
                    return gradeYear === currentYear || gradeYear === currentYear - 1;
                });
                localStorage.setItem('sman1_grades', JSON.stringify(filteredGrades));

                resolve();
            }, 3000);
        });
    }

    // Handle generate report
    async handleGenerateReport() {
        try {
            const reportData = await this.generateReport();
            this.displayReport(reportData);
            this.showMessage('Laporan berhasil digenerate!', 'success');
        } catch (error) {
            this.showMessage('Gagal generate laporan: ' + error.message, 'error');
        }
    }

    // Generate report
    async generateReport() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const reportType = document.getElementById('reportType')?.value || 'academic';
                const period = document.getElementById('reportPeriod')?.value || 'monthly';
                
                const reportData = {
                    type: reportType,
                    period: period,
                    generatedAt: new Date().toISOString(),
                    generatedBy: this.currentUser.name,
                    summary: this.getReportSummary(),
                    details: this.getReportDetails(reportType, period)
                };
                
                resolve(reportData);
            }, 2000);
        });
    }

    // Load system data
    loadSystemData() {
        this.loadUsers();
        this.loadSystemStats();
        this.loadSettings();
    }

    // Load users
    loadUsers() {
        const users = JSON.parse(localStorage.getItem('sman1_users') || '[]');
        this.users = users;
        this.renderUsers();
    }

    // Load system statistics
    loadSystemStats() {
        const users = JSON.parse(localStorage.getItem('sman1_users') || '[]');
        const exams = JSON.parse(localStorage.getItem('sman1_exams') || '[]');
        const questions = JSON.parse(localStorage.getItem('sman1_questions') || '[]');
        
        this.systemStats = {
            totalUsers: users.length,
            totalStudents: users.filter(u => u.role === 'siswa').length,
            totalTeachers: users.filter(u => u.role === 'guru').length,
            totalAdmins: users.filter(u => u.role === 'admin').length,
            totalExams: exams.length,
            totalQuestions: questions.length,
            activeExams: exams.filter(e => e.status === 'published').length,
            systemUptime: this.calculateUptime(),
            storageUsage: this.calculateStorageUsage()
        };
        
        this.renderSystemStats();
    }

    // Load settings
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('sman1_settings') || '{}');
        this.renderSettings(settings);
    }

    // Render users in UI
    renderUsers() {
        const usersContainer = document.getElementById('usersContainer');
        if (!usersContainer) return;

        usersContainer.innerHTML = this.users.map(user => `
            <div class="user-card" data-id="${user.id}">
                <div class="d-flex align-items-center">
                    <img src="${this.getUserAvatar(user)}" alt="User" class="user-avatar">
                    <div class="user-info flex-grow-1">
                        <h6 class="user-name">${user.name}</h6>
                        <div class="user-details">
                            <span class="badge bg-${this.getRoleBadgeColor(user.role)}">${user.role}</span>
                            <span class="text-muted">${user.email}</span>
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn btn-sm btn-outline-primary me-1 edit-user" data-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-user" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render system statistics
    renderSystemStats() {
        const stats = this.systemStats;
        
        // Update stats cards
        const statElements = {
            '#statTotalUsers': stats.totalUsers,
            '#statTotalStudents': stats.totalStudents,
            '#statTotalTeachers': stats.totalTeachers,
            '#statTotalExams': stats.totalExams
        };

        Object.entries(statElements).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        });

        // Update progress bars
        const storagePercent = (stats.storageUsage / 100) * 100;
        const storageBar = document.querySelector('.storage-progress .progress-bar');
        if (storageBar) {
            storageBar.style.width = `${storagePercent}%`;
            storageBar.textContent = `${stats.storageUsage}%`;
        }
    }

    // Render settings in UI
    renderSettings(settings) {
        const settingsForm = document.getElementById('settingsForm');
        if (!settingsForm) return;

        // Populate form fields
        Object.entries(settings).forEach(([key, value]) => {
            const input = settingsForm.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });
    }

    // Search users
    searchUsers(query) {
        const filteredUsers = this.users.filter(user =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()) ||
            user.role.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredUsers(filteredUsers);
    }

    // Filter users
    filterUsers() {
        const roleFilter = document.getElementById('roleFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        
        const filteredUsers = this.users.filter(user => {
            const roleMatch = !roleFilter || user.role === roleFilter;
            const statusMatch = !statusFilter || user.status === statusFilter;
            return roleMatch && statusMatch;
        });
        
        this.renderFilteredUsers(filteredUsers);
    }

    // Render filtered users
    renderFilteredUsers(users) {
        const usersContainer = document.getElementById('usersContainer');
        if (!usersContainer) return;

        usersContainer.innerHTML = users.length > 0 ? 
            users.map(user => this.renderUserCard(user)).join('') :
            '<p class="text-muted text-center">Tidak ada user yang sesuai dengan filter</p>';
    }

    // Update report based on filters
    updateReport() {
        // This would regenerate the report based on current filters
        this.handleGenerateReport();
    }

    // Display report in UI
    displayReport(reportData) {
        const reportContainer = document.getElementById('reportContainer');
        if (!reportContainer) return;

        reportContainer.innerHTML = `
            <div class="report-header">
                <h4>Laporan ${reportData.type} - ${reportData.period}</h4>
                <p class="text-muted">Digenerate pada ${new Date(reportData.generatedAt).toLocaleString('id-ID')}</p>
            </div>
            <div class="report-content">
                <pre>${JSON.stringify(reportData, null, 2)}</pre>
            </div>
            <div class="report-actions">
                <button class="btn btn-primary" onclick="adminManager.downloadReport()">
                    <i class="fas fa-download me-2"></i>Download Laporan
                </button>
            </div>
        `;
    }

    // Download report
    downloadReport() {
        const reportContainer = document.getElementById('reportContainer');
        if (!reportContainer) return;

        const reportContent = reportContainer.innerText;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Utility methods
    getUserAvatar(user) {
        // Return appropriate avatar based on user role
        const avatarBase = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        return avatarBase;
    }

    getRoleBadgeColor(role) {
        const colorMap = {
            'admin': 'danger',
            'guru': 'primary',
            'siswa': 'success'
        };
        return colorMap[role] || 'secondary';
    }

    generateNIS() {
        // Generate random NIS
        return '2021' + Math.floor(1000 + Math.random() * 9000);
    }

    generateNIP() {
        // Generate random NIP
        return '1985' + Math.floor(10000000 + Math.random() * 90000000);
    }

    calculateUptime() {
        // Simulate uptime calculation
        return '99.8%';
    }

    calculateStorageUsage() {
        // Calculate approximate storage usage
        let totalSize = 0;
        ['sman1_users', 'sman1_exams', 'sman1_questions', 'sman1_grades', 'sman1_settings'].forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += new Blob([data]).size;
            }
        });
        
        // Convert to MB and calculate percentage (assuming 10MB limit for demo)
        const sizeInMB = totalSize / (1024 * 1024);
        const percentage = Math.min((sizeInMB / 10) * 100, 100);
        return Math.round(percentage);
    }

    getStudentsData() {
        const users = JSON.parse(localStorage.getItem('sman1_users') || '[]');
        return users.filter(u => u.role === 'siswa').map(student => ({
            NIS: student.nis,
            Nama: student.name,
            Kelas: student.class,
            Email: student.email,
            Status: student.status
        }));
    }

    getTeachersData() {
        const users = JSON.parse(localStorage.getItem('sman1_users') || '[]');
        return users.filter(u => u.role === 'guru').map(teacher => ({
            NIP: teacher.nip,
            Nama: teacher.name,
            Mata_Pelajaran: teacher.subject,
            Email: teacher.email,
            Status: teacher.status
        }));
    }

    getGradesData() {
        const grades = JSON.parse(localStorage.getItem('sman1_grades') || '[]');
        return grades.map(grade => ({
            NIS: grade.studentId,
            Mata_Pelajaran: grade.subject,
            Nilai: grade.grade,
            Tanggal: grade.createdAt
        }));
    }

    convertToCSV(data) {
        const studentsCSV = this.arrayToCSV(data.students);
        const teachersCSV = this.arrayToCSV(data.teachers);
        const gradesCSV = this.arrayToCSV(data.grades);
        
        return `DATA SISWA\n${studentsCSV}\n\nDATA GURU\n${teachersCSV}\n\nDATA NILAI\n${gradesCSV}`;
    }

    arrayToCSV(array) {
        if (array.length === 0) return '';
        
        const headers = Object.keys(array[0]);
        const rows = array.map(obj => headers.map(header => obj[header]));
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    getReportSummary() {
        return {
            totalStudents: this.systemStats.totalStudents,
            totalTeachers: this.systemStats.totalTeachers,
            totalExams: this.systemStats.totalExams,
            averageGrade: 78.5,
            passRate: '85%'
        };
    }

    getReportDetails(type, period) {
        // Generate detailed report data based on type and period
        return {
            period: period,
            data: ['Data detail akan ditampilkan di sini berdasarkan jenis laporan']
        };
    }

    // Check admin permissions
    checkPermissions() {
        if (this.currentUser?.role !== 'admin') {
            this.showMessage('Anda tidak memiliki akses ke halaman admin', 'error');
            // Redirect to appropriate dashboard
            setTimeout(() => {
                window.location.href = '../dashboard/guru.html';
            }, 2000);
        }
    }

    // Update UI with user data
    updateUIWithUserData() {
        if (!this.currentUser) return;

        const userInfoElements = {
            '.user-name': this.currentUser.name,
            '.user-role': 'Administrator',
            '.user-id': this.currentUser.username
        };

        Object.entries(userInfoElements).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element && value) {
                element.textContent = value;
            }
        });
    }

    showMessage(message, type = 'info') {
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type];

        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alertClass} alert-dismissible fade show`;
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.main-content') || document.body;
        container.insertBefore(alertElement, container.firstChild);

        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
    }
}

// Initialize Admin Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminManager;
}
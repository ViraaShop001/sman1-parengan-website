// Guru Module JavaScript for SMAN 1 Parengan Website

class GuruManager {
    constructor() {
        this.currentUser = null;
        this.exams = [];
        this.questions = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.initEventListeners();
        this.loadTeacherData();
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
        // Exam management
        this.initExamManagement();
        
        // Question bank
        this.initQuestionBank();
        
        // Grade management
        this.initGradeManagement();
        
        // Class management
        this.initClassManagement();
    }

    // Initialize exam management functionality
    initExamManagement() {
        // Create exam form
        const createExamForm = document.getElementById('createExamForm');
        if (createExamForm) {
            createExamForm.addEventListener('submit', (e) => this.handleCreateExam(e));
        }

        // Exam filters
        const examFilters = document.querySelectorAll('.exam-filter');
        examFilters.forEach(filter => {
            filter.addEventListener('change', () => this.filterExams());
        });

        // Delete exam buttons
        document.querySelectorAll('.delete-exam').forEach(button => {
            button.addEventListener('click', (e) => this.handleDeleteExam(e));
        });
    }

    // Initialize question bank functionality
    initQuestionBank() {
        // Add question form
        const addQuestionForm = document.getElementById('addQuestionForm');
        if (addQuestionForm) {
            addQuestionForm.addEventListener('submit', (e) => this.handleAddQuestion(e));
        }

        // Question search
        const questionSearch = document.getElementById('questionSearch');
        if (questionSearch) {
            questionSearch.addEventListener('input', (e) => this.searchQuestions(e.target.value));
        }

        // Question filters
        const questionFilters = document.querySelectorAll('.question-filter');
        questionFilters.forEach(filter => {
            filter.addEventListener('change', () => this.filterQuestions());
        });
    }

    // Initialize grade management functionality
    initGradeManagement() {
        // Grade input changes
        document.querySelectorAll('.grade-input').forEach(input => {
            input.addEventListener('change', (e) => this.updateGrade(e.target));
        });

        // Bulk grade actions
        const bulkGradeBtn = document.getElementById('bulkGradeBtn');
        if (bulkGradeBtn) {
            bulkGradeBtn.addEventListener('click', () => this.handleBulkGrading());
        }

        // Export grades
        const exportGradesBtn = document.getElementById('exportGradesBtn');
        if (exportGradesBtn) {
            exportGradesBtn.addEventListener('click', () => this.exportGrades());
        }
    }

    // Initialize class management functionality
    initClassManagement() {
        // Class selection
        const classSelect = document.getElementById('classSelect');
        if (classSelect) {
            classSelect.addEventListener('change', (e) => this.loadClassData(e.target.value));
        }

        // Student management
        this.initStudentManagement();
    }

    // Handle create exam
    async handleCreateExam(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const examData = {
            title: formData.get('examTitle'),
            subject: formData.get('subject'),
            type: formData.get('examType'),
            date: formData.get('examDate'),
            time: formData.get('examTime'),
            duration: parseInt(formData.get('duration')),
            totalQuestions: parseInt(formData.get('totalQuestions')),
            maxScore: parseInt(formData.get('maxScore')),
            instructions: formData.get('instructions'),
            classes: this.getSelectedClasses(),
            teacher: this.currentUser.name,
            createdAt: new Date().toISOString()
        };

        try {
            const createdExam = await this.createExam(examData);
            this.showMessage('Ulangan berhasil dibuat!', 'success');
            
            // Redirect to exam details or question input
            setTimeout(() => {
                window.location.href = `input-soal.html?exam=${createdExam.id}`;
            }, 1500);
        } catch (error) {
            this.showMessage('Gagal membuat ulangan: ' + error.message, 'error');
        }
    }

    // Create exam (simulate API call)
    async createExam(examData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Generate ID
                    examData.id = 'exam_' + Date.now();
                    examData.status = 'draft';
                    
                    // Save to localStorage (simulate database)
                    const exams = JSON.parse(localStorage.getItem('sman1_exams') || '[]');
                    exams.push(examData);
                    localStorage.setItem('sman1_exams', JSON.stringify(exams));
                    
                    resolve(examData);
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });
    }

    // Handle add question
    async handleAddQuestion(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const questionData = {
            text: formData.get('questionText'),
            subject: formData.get('questionSubject'),
            type: formData.get('questionType'),
            difficulty: formData.get('questionDifficulty'),
            options: this.getQuestionOptions(),
            correctAnswer: formData.get('correctAnswer'),
            score: parseInt(formData.get('questionScore')),
            explanation: formData.get('questionExplanation'),
            teacher: this.currentUser.name,
            createdAt: new Date().toISOString()
        };

        try {
            const createdQuestion = await this.addQuestion(questionData);
            this.showMessage('Soal berhasil ditambahkan!', 'success');
            e.target.reset();
            
            // Close modal if exists
            const modal = bootstrap.Modal.getInstance(document.getElementById('addQuestionModal'));
            if (modal) modal.hide();
            
            // Refresh question list
            this.loadQuestions();
        } catch (error) {
            this.showMessage('Gagal menambah soal: ' + error.message, 'error');
        }
    }

    // Add question to bank
    async addQuestion(questionData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Generate ID
                    questionData.id = 'question_' + Date.now();
                    
                    // Save to localStorage
                    const questions = JSON.parse(localStorage.getItem('sman1_questions') || '[]');
                    questions.push(questionData);
                    localStorage.setItem('sman1_questions', JSON.stringify(questions));
                    
                    resolve(questionData);
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });
    }

    // Get question options from form
    getQuestionOptions() {
        const options = [];
        const optionInputs = document.querySelectorAll('#addQuestionForm .option-item-creator input[type="text"]');
        
        optionInputs.forEach((input, index) => {
            options.push({
                id: String.fromCharCode(65 + index), // A, B, C, D
                text: input.value
            });
        });
        
        return options;
    }

    // Get selected classes from checkboxes
    getSelectedClasses() {
        const classCheckboxes = document.querySelectorAll('input[name="classes"]:checked');
        return Array.from(classCheckboxes).map(checkbox => checkbox.value);
    }

    // Update grade for student
    async updateGrade(inputElement) {
        const studentId = inputElement.getAttribute('data-student');
        const examId = inputElement.getAttribute('data-exam');
        const grade = inputElement.value;
        
        try {
            await this.saveGrade(studentId, examId, grade);
            this.showMessage('Nilai berhasil diperbarui', 'success');
        } catch (error) {
            this.showMessage('Gagal memperbarui nilai', 'error');
            // Revert value
            inputElement.value = inputElement.getAttribute('data-original-value');
        }
    }

    // Save grade (simulate API call)
    async saveGrade(studentId, examId, grade) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Save to localStorage
                const grades = JSON.parse(localStorage.getItem('sman1_grades') || '[]');
                const existingIndex = grades.findIndex(g => g.studentId === studentId && g.examId === examId);
                
                if (existingIndex > -1) {
                    grades[existingIndex].grade = grade;
                    grades[existingIndex].updatedAt = new Date().toISOString();
                } else {
                    grades.push({
                        studentId,
                        examId,
                        grade,
                        teacher: this.currentUser.name,
                        createdAt: new Date().toISOString()
                    });
                }
                
                localStorage.setItem('sman1_grades', JSON.stringify(grades));
                resolve();
            }, 500);
        });
    }

    // Handle bulk grading
    async handleBulkGrading() {
        const selectedStudents = this.getSelectedStudents();
        if (selectedStudents.length === 0) {
            this.showMessage('Pilih siswa terlebih dahulu', 'warning');
            return;
        }

        const grade = prompt('Masukkan nilai untuk siswa terpilih:');
        if (grade && !isNaN(grade)) {
            try {
                await this.bulkSaveGrades(selectedStudents, grade);
                this.showMessage(`Nilai berhasil diberikan untuk ${selectedStudents.length} siswa`, 'success');
                this.loadClassData(); // Refresh data
            } catch (error) {
                this.showMessage('Gagal memberikan nilai', 'error');
            }
        }
    }

    // Bulk save grades
    async bulkSaveGrades(studentIds, grade) {
        const promises = studentIds.map(studentId => 
            this.saveGrade(studentId, 'current_exam', grade)
        );
        return Promise.all(promises);
    }

    // Get selected students
    getSelectedStudents() {
        const selectedCheckboxes = document.querySelectorAll('input[name="selectedStudent"]:checked');
        return Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
    }

    // Export grades
    exportGrades() {
        const grades = this.getCurrentGrades();
        const csvContent = this.convertToCSV(grades);
        this.downloadCSV(csvContent, 'rekap_nilai.csv');
        this.showMessage('Data berhasil diexport', 'success');
    }

    // Convert grades to CSV
    convertToCSV(grades) {
        const headers = ['NIS', 'Nama', 'Mata Pelajaran', 'Nilai', 'Grade'];
        const rows = grades.map(grade => [
            grade.studentId,
            grade.studentName,
            grade.subject,
            grade.grade,
            this.calculateGrade(grade.grade)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Download CSV file
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Calculate grade from score
    calculateGrade(score) {
        if (score >= 85) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        return 'D';
    }

    // Load teacher data
    loadTeacherData() {
        this.loadExams();
        this.loadQuestions();
        this.loadClasses();
    }

    // Load exams for teacher
    loadExams() {
        const exams = JSON.parse(localStorage.getItem('sman1_exams') || '[]');
        this.exams = exams.filter(exam => exam.teacher === this.currentUser?.name);
        this.renderExams();
    }

    // Load questions for teacher
    loadQuestions() {
        const questions = JSON.parse(localStorage.getItem('sman1_questions') || '[]');
        this.questions = questions.filter(q => q.teacher === this.currentUser?.name);
        this.renderQuestions();
    }

    // Load classes for teacher
    loadClasses() {
        // This would typically come from an API
        const teacherClasses = ['XII IPA 1', 'XI IPA 1', 'X IPA 1'];
        this.renderClasses(teacherClasses);
    }

    // Render exams in UI
    renderExams() {
        const examsContainer = document.getElementById('examsContainer');
        if (!examsContainer) return;

        examsContainer.innerHTML = this.exams.map(exam => `
            <div class="exam-card ${exam.status}">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h4>${exam.title}</h4>
                    <span class="exam-status status-${exam.status}">${this.getStatusText(exam.status)}</span>
                </div>
                <p class="text-muted mb-2"><i class="fas fa-book me-2"></i>${exam.subject}</p>
                <p class="text-muted mb-2"><i class="fas fa-calendar me-2"></i>${this.formatDate(exam.date)}</p>
                <p class="text-muted mb-3"><i class="fas fa-clock me-2"></i>${exam.duration} menit</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">${exam.totalQuestions} Soal</span>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 edit-exam" data-id="${exam.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-exam" data-id="${exam.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render questions in UI
    renderQuestions() {
        const questionsContainer = document.getElementById('questionsContainer');
        if (!questionsContainer) return;

        questionsContainer.innerHTML = this.questions.map(question => `
            <div class="question-preview" data-id="${question.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <h6>${question.text}</h6>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1 edit-question" data-id="${question.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-question" data-id="${question.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="preview-options">
                    ${question.options.map(opt => `
                        <div class="option-preview">
                            <span class="option-letter-preview">${opt.id}</span>
                            <span>${opt.text}</span>
                            ${opt.id === question.correctAnswer ? '<span class="correct-option ms-2">✓ Benar</span>' : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="question-meta">
                    <span><i class="fas fa-book me-1"></i> ${question.subject}</span>
                    <span><i class="fas fa-star me-1"></i> ${question.difficulty}</span>
                    <span><i class="fas fa-clock me-1"></i> ${question.score} poin</span>
                    <span><i class="fas fa-calendar me-1"></i> ${this.formatDate(question.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    // Render classes in UI
    renderClasses(classes) {
        const classesContainer = document.getElementById('classesContainer');
        if (!classesContainer) return;

        classesContainer.innerHTML = classes.map(className => `
            <div class="col-md-4 mb-3">
                <div class="class-card">
                    <h5>${className}</h5>
                    <p class="text-muted">25 Siswa</p>
                    <a href="#" class="btn btn-primary btn-sm">Kelola Kelas</a>
                </div>
            </div>
        `).join('');
    }

    // Update UI with user data
    updateUIWithUserData() {
        if (!this.currentUser) return;

        // Update user info elements
        const userInfoElements = {
            '.user-name': this.currentUser.name,
            '.user-role': 'Guru',
            '.user-id': this.currentUser.nip || this.currentUser.username,
            '.user-subject': this.currentUser.mataPelajaran || ''
        };

        Object.entries(userInfoElements).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element && value) {
                element.textContent = value;
            }
        });
    }

    // Filter exams based on criteria
    filterExams() {
        const subjectFilter = document.getElementById('subjectFilter')?.value;
        const statusFilter = document.getElementById('statusFilter')?.value;
        
        const filteredExams = this.exams.filter(exam => {
            const subjectMatch = !subjectFilter || exam.subject === subjectFilter;
            const statusMatch = !statusFilter || exam.status === statusFilter;
            return subjectMatch && statusMatch;
        });
        
        this.renderFilteredExams(filteredExams);
    }

    // Filter questions based on criteria
    filterQuestions() {
        const subjectFilter = document.getElementById('questionSubjectFilter')?.value;
        const difficultyFilter = document.getElementById('questionDifficultyFilter')?.value;
        
        const filteredQuestions = this.questions.filter(question => {
            const subjectMatch = !subjectFilter || question.subject === subjectFilter;
            const difficultyMatch = !difficultyFilter || question.difficulty === difficultyFilter;
            return subjectMatch && difficultyMatch;
        });
        
        this.renderFilteredQuestions(filteredQuestions);
    }

    // Search questions
    searchQuestions(query) {
        const filteredQuestions = this.questions.filter(question =>
            question.text.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredQuestions(filteredQuestions);
    }

    // Render filtered exams
    renderFilteredExams(exams) {
        // Similar to renderExams but with filtered data
        const examsContainer = document.getElementById('examsContainer');
        if (!examsContainer) return;

        examsContainer.innerHTML = exams.length > 0 ? 
            exams.map(exam => this.renderExamCard(exam)).join('') :
            '<p class="text-muted text-center">Tidak ada ulangan yang sesuai dengan filter</p>';
    }

    // Render filtered questions
    renderFilteredQuestions(questions) {
        const questionsContainer = document.getElementById('questionsContainer');
        if (!questionsContainer) return;

        questionsContainer.innerHTML = questions.length > 0 ? 
            questions.map(question => this.renderQuestionCard(question)).join('') :
            '<p class="text-muted text-center">Tidak ada soal yang sesuai dengan filter</p>';
    }

    // Render single exam card
    renderExamCard(exam) {
        return `
            <div class="exam-card ${exam.status}">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h4>${exam.title}</h4>
                    <span class="exam-status status-${exam.status}">${this.getStatusText(exam.status)}</span>
                </div>
                <!-- Rest of exam card HTML -->
            </div>
        `;
    }

    // Render single question card
    renderQuestionCard(question) {
        return `
            <div class="question-preview" data-id="${question.id}">
                <!-- Question card HTML -->
            </div>
        `;
    }

    // Utility methods
    getStatusText(status) {
        const statusMap = {
            'draft': 'Draft',
            'published': 'Diterbitkan',
            'completed': 'Selesai',
            'graded': 'Telah Dinilai'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    showMessage(message, type = 'info') {
        // Implementation similar to other modules
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

    // Get current grades for export
    getCurrentGrades() {
        // This would typically come from an API
        return [
            { studentId: '20210012', studentName: 'Ahmad Fauzi', subject: 'Matematika', grade: 85 },
            { studentId: '20210013', studentName: 'Siti Rahma', subject: 'Matematika', grade: 92 },
            { studentId: '20210014', studentName: 'Budi Santoso', subject: 'Matematika', grade: 78 }
        ];
    }
}

// Initialize Guru Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.guruManager = new GuruManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GuruManager;
}
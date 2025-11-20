// Ulangan Module JavaScript for SMAN 1 Parengan Website

class UlanganManager {
    constructor() {
        this.currentExam = null;
        this.studentAnswers = {};
        this.currentQuestionIndex = 0;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadExamData();
    }

    // Initialize event listeners
    initEventListeners() {
        // Exam filter functionality
        this.initExamFilters();
        
        // Question navigation
        this.initQuestionNavigation();
        
        // Timer functionality
        this.initTimer();
        
        // Form submissions
        this.initForms();
    }

    // Initialize exam filters
    initExamFilters() {
        const filterButtons = document.querySelectorAll('.filter-buttons .btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                
                // Add active class to clicked button
                e.target.classList.add('active');
                e.target.classList.remove('btn-outline-primary');
                e.target.classList.add('btn-primary');
                
                const filter = e.target.getAttribute('data-filter');
                this.filterExams(filter);
            });
        });
    }

    // Filter exams based on status
    filterExams(filter) {
        const examCards = document.querySelectorAll('#examList .col-lg-6');
        
        examCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                if (card.getAttribute('data-status') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    // Initialize question navigation
    initQuestionNavigation() {
        // Previous button
        const prevButton = document.getElementById('prevButton');
        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousQuestion());
        }

        // Next button
        const nextButton = document.getElementById('nextButton');
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextQuestion());
        }

        // Question indicators
        const questionIndicators = document.querySelectorAll('.question-indicator');
        questionIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.navigateToQuestion(index));
        });
    }

    // Initialize timer
    initTimer() {
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;

        // Get exam duration from data attribute or default
        const examDuration = timerElement.getAttribute('data-duration') || 90;
        this.timeLeft = examDuration * 60; // Convert to seconds

        this.startTimer();
    }

    // Start exam timer
    startTimer() {
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;

        this.timerInterval = setInterval(() => {
            if (this.timeLeft <= 0) {
                this.finishExam();
                return;
            }

            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            this.timeLeft--;

            // Visual warnings
            if (this.timeLeft === 5 * 60) { // 5 minutes left
                timerElement.classList.add('warning');
            }

            if (this.timeLeft === 60) { // 1 minute left
                timerElement.classList.remove('warning');
                timerElement.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
            }
        }, 1000);
    }

    // Navigate to previous question
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion(this.currentQuestionIndex);
        }
    }

    // Navigate to next question
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentExam.questions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion(this.currentQuestionIndex);
        }
    }

    // Navigate to specific question
    navigateToQuestion(index) {
        this.currentQuestionIndex = index;
        this.loadQuestion(index);
    }

    // Load question data
    loadQuestion(index) {
        if (!this.currentExam || !this.currentExam.questions[index]) return;

        const question = this.currentExam.questions[index];
        
        // Update question number and text
        document.getElementById('currentQuestionNumber').textContent = index + 1;
        document.getElementById('questionText').textContent = question.text;
        
        // Load options
        this.loadOptions(question);
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Update navigation indicators
        this.updateNavigationIndicators();
    }

    // Load question options
    loadOptions(question) {
        const optionsContainer = document.getElementById('optionsContainer');
        if (!optionsContainer) return;

        optionsContainer.innerHTML = '';

        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = `option-item ${this.studentAnswers[question.id] === option.id ? 'selected' : ''}`;
            optionElement.innerHTML = `
                <span class="option-letter">${option.id}</span>
                <span>${option.text}</span>
            `;
            optionElement.addEventListener('click', () => this.selectOption(question.id, option.id));
            
            optionsContainer.appendChild(optionElement);
        });
    }

    // Select an option
    selectOption(questionId, optionId) {
        this.studentAnswers[questionId] = optionId;
        this.loadQuestion(this.currentQuestionIndex); // Reload to update UI
        this.updateAnswerCounts();
    }

    // Update navigation buttons state
    updateNavigationButtons() {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');

        if (prevButton) {
            prevButton.disabled = this.currentQuestionIndex === 0;
        }

        if (nextButton) {
            nextButton.disabled = this.currentQuestionIndex === this.currentExam.questions.length - 1;
        }
    }

    // Update navigation indicators
    updateNavigationIndicators() {
        const indicators = document.querySelectorAll('.question-indicator');
        
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('answered', 'current');
            
            const questionId = this.currentExam.questions[index].id;
            if (this.studentAnswers[questionId]) {
                indicator.classList.add('answered');
            }
            
            if (index === this.currentQuestionIndex) {
                indicator.classList.add('current');
            }
        });
    }

    // Update answer counts
    updateAnswerCounts() {
        const answeredCount = Object.keys(this.studentAnswers).length;
        const unansweredCount = this.currentExam.questions.length - answeredCount;
        
        const answeredElement = document.getElementById('answeredCount');
        const unansweredElement = document.getElementById('unansweredCount');
        
        if (answeredElement) answeredElement.textContent = answeredCount;
        if (unansweredElement) unansweredElement.textContent = unansweredCount;
    }

    // Initialize forms
    initForms() {
        // Exam creation form
        const createExamForm = document.getElementById('createExamForm');
        if (createExamForm) {
            createExamForm.addEventListener('submit', (e) => this.handleCreateExam(e));
        }

        // Question creation form
        const addQuestionForm = document.getElementById('addQuestionForm');
        if (addQuestionForm) {
            addQuestionForm.addEventListener('submit', (e) => this.handleAddQuestion(e));
        }

        // Finish exam confirmation
        const confirmFinish = document.getElementById('confirmFinish');
        if (confirmFinish) {
            confirmFinish.addEventListener('click', () => this.finishExam());
        }
    }

    // Handle exam creation
    handleCreateExam(e) {
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
            classes: this.getSelectedClasses()
        };

        // Validate exam data
        if (this.validateExamData(examData)) {
            this.saveExam(examData);
            this.showMessage('Ulangan berhasil dibuat!', 'success');
            
            // Redirect to question input page
            setTimeout(() => {
                window.location.href = 'input-soal.html';
            }, 1500);
        }
    }

    // Get selected classes from checkboxes
    getSelectedClasses() {
        const classCheckboxes = document.querySelectorAll('input[name="classes"]:checked');
        return Array.from(classCheckboxes).map(checkbox => checkbox.value);
    }

    // Validate exam data
    validateExamData(examData) {
        if (!examData.title || !examData.subject || !examData.type) {
            this.showMessage('Harap isi semua field yang wajib.', 'error');
            return false;
        }

        if (examData.duration < 5 || examData.duration > 180) {
            this.showMessage('Durasi ulangan harus antara 5-180 menit.', 'error');
            return false;
        }

        if (examData.classes.length === 0) {
            this.showMessage('Pilih minimal satu kelas.', 'error');
            return false;
        }

        return true;
    }

    // Save exam data (simulate API call)
    saveExam(examData) {
        // In a real application, this would be an API call
        const exams = JSON.parse(localStorage.getItem('sman1_exams') || '[]');
        examData.id = 'exam_' + Date.now();
        examData.createdAt = new Date().toISOString();
        examData.status = 'draft';
        
        exams.push(examData);
        localStorage.setItem('sman1_exams', JSON.stringify(exams));
        
        return examData;
    }

    // Handle adding question
    handleAddQuestion(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const questionData = {
            text: formData.get('questionText'),
            options: this.getQuestionOptions(),
            correctAnswer: formData.get('correctAnswer'),
            score: parseInt(formData.get('questionScore'))
        };

        if (this.validateQuestionData(questionData)) {
            this.addQuestion(questionData);
            this.showMessage('Soal berhasil ditambahkan!', 'success');
            e.target.reset();
            
            // Close modal if exists
            const modal = bootstrap.Modal.getInstance(document.getElementById('addQuestionModal'));
            if (modal) modal.hide();
        }
    }

    // Get question options from form
    getQuestionOptions() {
        const options = [];
        const optionInputs = document.querySelectorAll('#addQuestionForm .option-item input');
        
        optionInputs.forEach((input, index) => {
            options.push({
                id: String.fromCharCode(65 + index), // A, B, C, D
                text: input.value
            });
        });
        
        return options;
    }

    // Validate question data
    validateQuestionData(questionData) {
        if (!questionData.text) {
            this.showMessage('Teks soal tidak boleh kosong.', 'error');
            return false;
        }

        if (questionData.options.some(opt => !opt.text)) {
            this.showMessage('Semua pilihan jawaban harus diisi.', 'error');
            return false;
        }

        if (!questionData.correctAnswer) {
            this.showMessage('Pilih jawaban yang benar.', 'error');
            return false;
        }

        if (questionData.score < 1 || questionData.score > 100) {
            this.showMessage('Nilai soal harus antara 1-100.', 'error');
            return false;
        }

        return true;
    }

    // Add question to exam
    addQuestion(questionData) {
        questionData.id = 'question_' + Date.now();
        
        // In a real application, this would be an API call
        const questions = JSON.parse(localStorage.getItem('sman1_questions') || '[]');
        questions.push(questionData);
        localStorage.setItem('sman1_questions', JSON.stringify(questions));
        
        // Update UI
        this.updateQuestionList(questionData);
        
        return questionData;
    }

    // Update question list in UI
    updateQuestionList(questionData) {
        const questionList = document.getElementById('questionList');
        if (!questionList) return;

        const questionElement = document.createElement('div');
        questionElement.className = 'question-card';
        questionElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h5>Soal Baru</h5>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-1 edit-question"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-question"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p class="fw-bold">${questionData.text}</p>
            <div class="options">
                ${questionData.options.map(opt => `
                    <div class="option-item">
                        <span class="option-letter">${opt.id}</span>
                        <span>${opt.text}</span>
                    </div>
                `).join('')}
            </div>
            <div class="mt-3">
                <span class="badge bg-success">Jawaban: ${questionData.correctAnswer}</span>
                <span class="badge bg-primary ms-2">Nilai: ${questionData.score}</span>
            </div>
        `;

        questionList.appendChild(questionElement);
    }

    // Finish exam
    finishExam() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Calculate score
        const score = this.calculateScore();
        
        // Save results
        this.saveExamResults(score);
        
        // Show completion message
        this.showMessage('Ulangan telah diselesaikan! Mengarahkan ke hasil...', 'success');
        
        // Redirect to results page
        setTimeout(() => {
            window.location.href = 'hasil-ulangan.html';
        }, 2000);
    }

    // Calculate exam score
    calculateScore() {
        if (!this.currentExam) return 0;

        let correctAnswers = 0;
        this.currentExam.questions.forEach(question => {
            if (this.studentAnswers[question.id] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const percentage = (correctAnswers / this.currentExam.questions.length) * 100;
        return Math.round(percentage);
    }

    // Save exam results
    saveExamResults(score) {
        const results = {
            examId: this.currentExam.id,
            studentId: 'current_user', // In real app, get from auth
            answers: this.studentAnswers,
            score: score,
            completedAt: new Date().toISOString(),
            timeSpent: this.currentExam.duration * 60 - this.timeLeft
        };

        // In a real application, this would be an API call
        const allResults = JSON.parse(localStorage.getItem('sman1_exam_results') || '[]');
        allResults.push(results);
        localStorage.setItem('sman1_exam_results', JSON.stringify(allResults));
    }

    // Load exam data
    loadExamData() {
        // This would typically load from an API
        // For demo, we'll use inline data or localStorage
        const examDataElement = document.getElementById('examData');
        if (examDataElement) {
            this.currentExam = JSON.parse(examDataElement.textContent);
        }
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.exam-message');
        existingMessages.forEach(msg => msg.remove());

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type} exam-message alert-dismissible fade show`;
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

    // Utility function to format time
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Get exam results for student
    getStudentResults(studentId) {
        const allResults = JSON.parse(localStorage.getItem('sman1_exam_results') || '[]');
        return allResults.filter(result => result.studentId === studentId);
    }

    // Get exam statistics for teacher
    getExamStatistics(examId) {
        const allResults = JSON.parse(localStorage.getItem('sman1_exam_results') || '[]');
        const examResults = allResults.filter(result => result.examId === examId);
        
        if (examResults.length === 0) return null;

        const scores = examResults.map(result => result.score);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);

        return {
            totalStudents: examResults.length,
            averageScore: Math.round(average),
            highestScore: highest,
            lowestScore: lowest,
            passingRate: (scores.filter(score => score >= 75).length / scores.length) * 100
        };
    }
}

// Initialize Ulangan Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ulanganManager = new UlanganManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UlanganManager;
}
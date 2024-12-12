class WordReader {
    constructor() {
        this.textInput = document.getElementById('texto');
        this.startBtn = document.getElementById('start-reading');
        this.textInputContainer = document.getElementById('text-input-container');
        this.readingContainer = document.getElementById('reading-container');
        this.currentWordElement = document.getElementById('current-word');
        this.previousWordElement = document.getElementById('previous-word');
        this.nextWordElement = document.getElementById('next-word');
        this.backBtn = document.getElementById('back-btn');
        this.forwardBtn = document.getElementById('forward-btn');
        this.resetBtn = document.getElementById('reset-btn');

        this.words = [];
        this.currentIndex = 0;

        this.bindEvents();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startReading());
        this.backBtn.addEventListener('click', () => this.previousWord());
        this.forwardBtn.addEventListener('click', () => this.nextWord());
        this.resetBtn.addEventListener('click', () => this.resetReading());

        document.addEventListener('keydown', (e) => {
            if (this.readingContainer.classList.contains('active')) {
                switch(e.key) {
                    case 'ArrowLeft': this.previousWord(); break;
                    case 'ArrowRight': 
                    case ' ': 
                        e.preventDefault(); 
                        this.nextWord(); 
                        break;
                    case 'Escape': this.resetReading(); break;
                }
            }
        });
    }

    startReading() {
        this.words = this.textInput.value.trim().split(/\s+/);
        if (this.words.length === 0) return;

        this.textInputContainer.classList.remove('active');
        this.textInputContainer.classList.add('hidden');
        this.readingContainer.classList.remove('hidden');
        this.readingContainer.classList.add('active');

        this.currentIndex = 0;
        this.updateWordDisplay();
    }

    updateWordDisplay() {
        // Set data-text attribute for neon effect
        this.currentWordElement.setAttribute('data-text', this.words[this.currentIndex]);
        this.currentWordElement.textContent = this.words[this.currentIndex];
        
        this.previousWordElement.textContent = this.currentIndex > 0 
            ? this.words[this.currentIndex - 1] 
            : '';
        
        this.nextWordElement.textContent = this.currentIndex < this.words.length - 1 
            ? this.words[this.currentIndex + 1] 
            : '';
    }

    previousWord() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateWordDisplay();
        }
    }

    nextWord() {
        if (this.currentIndex < this.words.length - 1) {
            this.currentIndex++;
            this.updateWordDisplay();
        }
    }

    resetReading() {
        this.textInputContainer.classList.remove('hidden');
        this.textInputContainer.classList.add('active');
        this.readingContainer.classList.remove('active');
        this.readingContainer.classList.add('hidden');
        this.textInput.value = '';
        this.words = [];
        this.currentIndex = 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WordReader();
});
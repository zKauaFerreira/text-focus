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
        // Configura o texto e atualiza os elementos para o efeito neon
        this.currentWordElement.setAttribute('data-text', this.words[this.currentIndex]);
        this.currentWordElement.textContent = this.words[this.currentIndex];
        
        this.previousWordElement.textContent = this.currentIndex > 0 
            ? this.words[this.currentIndex - 1] 
            : '';
        
        this.nextWordElement.textContent = this.currentIndex < this.words.length - 1 
            ? this.words[this.currentIndex + 1] 
            : '';
    
        // Remove qualquer fala ativa antes de começar a próxima
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    
        // Transforma o texto para leitura literal de pontuações e aspas
        const literalText = this.transformTextForSpeech(this.words[this.currentIndex]);
    
        // Divide o texto em segmentos e fala cada um com pausa
        this.speakWithPause(literalText.split(' '), 1); // Pausa de 1 segundo
    }
    
    transformTextForSpeech(text) {
        // Substitui caracteres por seus equivalentes falados e adiciona lógica para aspas
        return text
            .replace(/"/g, (match, offset, string) => {
                if (offset === 0 || string[offset - 1] === ' ') {
                    return ' abre aspas';
                }
                if (offset === string.length - 1 || string[offset + 1] === ' ') {
                    return ' fecha aspas';
                }
                return ' aspas'; // Fallback para casos complexos
            })
            .replace(/\./g, ' ponto')
            .replace(/,/g, ' vírgula')
            .replace(/!/g, ' exclamação')
            .replace(/\?/g, ' interrogação')
            .replace(/:/g, ' dois pontos')
            .replace(/;/g, ' ponto e vírgula')
            .replace(/\(/g, ' abre parênteses')
            .replace(/\)/g, ' fecha parênteses')
            .replace(/\[/g, ' abre colchetes')
            .replace(/\]/g, ' fecha colchetes')
            .replace(/\{/g, ' abre chaves')
            .replace(/\}/g, ' fecha chaves')
            .replace(/-/g, ' traço')
            .replace(/_/g, ' underline')
            .replace(/\//g, ' barra')
            .replace(/\\/g, ' barra invertida')
            .replace(/\*/g, ' asterisco')
            .replace(/\&/g, ' e comercial')
            .replace(/#/g, ' cerquilha')
            .replace(/@/g, ' arroba')
            .replace(/\$/g, ' cifrão')
            .replace(/%/g, ' porcentagem')
            .replace(/\^/g, ' circunflexo')
            .replace(/~/g, ' til')
            .replace(/`/g, ' acento grave');
    }
    
    speakWithPause(segments, delay) {
        // Itera sobre os segmentos, falando cada um com um atraso
        let index = 0;
    
        const speakNext = () => {
            if (index < segments.length) {
                const utterance = new SpeechSynthesisUtterance(segments[index]);
                utterance.rate = 1.2; // Velocidade ligeiramente acima do normal
                utterance.pitch = 1.1; // Tom levemente ajustado para ser mais agradável
                utterance.voice = this.getPreferredVoice('pt-BR'); // Obtém a melhor voz para PT-BR
                speechSynthesis.speak(utterance);
    
                index++;
                setTimeout(speakNext, delay); // Aguarda antes de falar o próximo segmento
            }
        };
    
        speakNext();
    }
    
    getPreferredVoice(langCode) {
        // Obtém as vozes disponíveis
        const voices = speechSynthesis.getVoices();
        // Tenta encontrar uma voz de alta qualidade para o idioma
        return (
            voices.find(voice => voice.lang === langCode && voice.name.includes('Google')) || 
            voices.find(voice => voice.lang === langCode) || 
            voices[0] // Pega qualquer voz se não encontrar uma específica
        );
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

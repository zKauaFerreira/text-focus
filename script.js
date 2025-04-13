/**
 * Text Focus - Ferramenta de Leitura Dinâmica com IA
 * script.js - Funcionalidades principais
 */

document.addEventListener('DOMContentLoaded', function() {
    // ====== Inicialização e configurações ======
    const appConfig = {
        // Configurações padrão
        theme: 'light',
        font: 'Inter',
        fontSize: 16,
        enableAnimations: true,

        // Configurações de leitura
        prevWords: 1,
        nextWords: 1,
        wpm: 300,
        highlightLongWords: true,
        pauseOnPunctuation: true,

        // Configurações de áudio
        enableTTS: true,
        ttsRate: 1.0,
        ttsVolume: 1.0,
        enableLofi: true,
        enableAmbientSounds: true,
        rememberAudioSettings: true,

        // Configurações de IA
        apiKey: '',
        apiModel: 'llama3-70b-8192',
        aiTemperature: 0.7,
        aiMaxTokens: 1000
    };

    // Estado da aplicação
    const appState = {
        isDarkTheme: false,
        isReading: false,
        isPaused: true,
        currentWordIndex: 0,
        words: [],
        readingInterval: null,
        readingStartTime: null,
        readingTime: 0,
        wordsRead: 0,
        isTTSPlaying: false,
        isTTSSpeaking: false,
        lofiAudio: null,
        ambientSounds: {},
        currentTheme: 'light',
        showShortcuts: false,
        sessions: []
    };

    // ====== Elementos DOM ======
    // Elementos principais
    const textInput = document.getElementById('textInput');
    const startReadingBtn = document.getElementById('startReadingBtn');
    const clearTextBtn = document.getElementById('clearTextBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const statsBtn = document.getElementById('statsBtn');
    const iaGenBtn = document.getElementById('iaGenBtn');

    // Elementos do leitor
    const readerSection = document.getElementById('readerSection');
    const previousWords = document.querySelector('.previous-words');
    const currentWord = document.querySelector('.current-word');
    const nextWords = document.querySelector('.next-words');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const wpmSlider = document.getElementById('wpmSlider');
    const wpmValue = document.getElementById('wpmValue');

    // Elementos de modal
    const modals = document.querySelectorAll('.modal-overlay');
    const modalCloseBtns = document.querySelectorAll('.modal-close-btn');
    const settingsModal = document.getElementById('settingsModal');
    const statsModal = document.getElementById('statsModal');
    const iaModal = document.getElementById('iaModal');

    // Elementos de abas
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
    const settingsTabContents = document.querySelectorAll('.settings-tab-content');
    const statsTabBtns = document.querySelectorAll('.stats-tab-btn');
    const statsTabContents = document.querySelectorAll('.stats-tab-content');
    const aiModeBtns = document.querySelectorAll('.ai-mode-btn');
    const aiModeContents = document.querySelectorAll('.ai-mode-content');

    // Elementos de tema
    const themeBtns = document.querySelectorAll('.theme-btn');

    // ====== Funções de utilidade ======

    /**
     * Salva as configurações no localStorage
     */
    function saveConfig() {
        localStorage.setItem('textFocusConfig', JSON.stringify(appConfig));
    }

    /**
     * Carrega as configurações do localStorage
     */
    function loadConfig() {
        const savedConfig = localStorage.getItem('textFocusConfig');
        if (savedConfig) {
            Object.assign(appConfig, JSON.parse(savedConfig));
            applyConfig();
        }
    }

    /**
     * Aplica as configurações carregadas
     */
    function applyConfig() {
        // Aplicar tema
        setTheme(appConfig.theme);

        // Aplicar fonte
        document.body.style.fontFamily = appConfig.font + ', ' + getComputedStyle(document.body).fontFamily.split(',').slice(1).join(',');

        // Aplicar tamanho da fonte
        document.documentElement.style.fontSize = appConfig.fontSize + 'px';

        // Aplicar animações
        if (!appConfig.enableAnimations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }

        // Aplicar configurações de leitura
        wpmSlider.value = appConfig.wpm;
        wpmValue.textContent = appConfig.wpm;

        // Atualizar interface de configurações
        updateSettingsUI();
    }

    /**
     * Atualiza a interface do menu de configurações
     */
    function updateSettingsUI() {
        // Atualizar tema ativo
        themeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === appConfig.theme) {
                btn.classList.add('active');
            }
        });

        // Atualizar seleção de fonte
        document.getElementById('fontSelect').value = appConfig.font;

        // Atualizar tamanho da fonte
        document.getElementById('fontSizeSlider').value = appConfig.fontSize;
        document.getElementById('fontSizeValue').textContent = appConfig.fontSize + 'px';

        // Atualizar configurações de animações
        document.getElementById('enableAnimations').checked = appConfig.enableAnimations;

        // Atualizar configurações de leitura
        document.getElementById('prevWordsSlider').value = appConfig.prevWords;
        document.getElementById('prevWordsValue').textContent = appConfig.prevWords;
        document.getElementById('nextWordsSlider').value = appConfig.nextWords;
        document.getElementById('nextWordsValue').textContent = appConfig.nextWords;
        document.getElementById('defaultWpmSlider').value = appConfig.wpm;
        document.getElementById('defaultWpmValue').textContent = appConfig.wpm + ' PPM';
        document.getElementById('highlightLongWords').checked = appConfig.highlightLongWords;
        document.getElementById('pauseOnPunctuation').checked = appConfig.pauseOnPunctuation;

        // Atualizar configurações de áudio
        document.getElementById('enableTTS').checked = appConfig.enableTTS;
        document.getElementById('defaultTTSRateSlider').value = appConfig.ttsRate;
        document.getElementById('defaultTTSRateValue').textContent = appConfig.ttsRate.toFixed(1) + 'x';
        document.getElementById('enableLofi').checked = appConfig.enableLofi;
        document.getElementById('enableAmbientSounds').checked = appConfig.enableAmbientSounds;
        document.getElementById('rememberAudioSettings').checked = appConfig.rememberAudioSettings;

        // Atualizar configurações de IA
        document.getElementById('apiKeyInput').value = appConfig.apiKey;
        document.getElementById('apiModelSelect').value = appConfig.apiModel;
        document.getElementById('aiTempSlider').value = appConfig.aiTemperature;
        document.getElementById('aiTempValue').textContent = appConfig.aiTemperature;
        document.getElementById('aiMaxTokensSlider').value = appConfig.aiMaxTokens;
        document.getElementById('aiMaxTokensValue').textContent = appConfig.aiMaxTokens + ' tokens';
    }

    /**
     * Define o tema da aplicação
     * @param {string} theme - Nome do tema
     */
    function setTheme(theme) {
        document.body.dataset.theme = theme;
        appConfig.theme = theme;
        appState.currentTheme = theme;
    }

    /**
     * Mostra um modal
     * @param {HTMLElement} modal - Elemento modal a ser exibido
     */
    function showModal(modal) {
        modal.classList.add('active');

        // Atualizar estatísticas se for o modal de estatísticas
        if (modal === statsModal) {
            updateStatistics();
        }
    }

    /**
     * Esconde um modal
     * @param {HTMLElement} modal - Elemento modal a ser escondido
     */
    function hideModal(modal) {
        modal.classList.remove('active');
    }

    /**
     * Alterna entre as abas
     * @param {HTMLElement} tabBtn - Botão da aba
     * @param {NodeList} buttons - Lista de botões de abas
     * @param {NodeList} contents - Lista de conteúdos de abas
     */
    function switchTab(tabBtn, buttons, contents) {
        const tabId = tabBtn.dataset.tab;

        // Desativa todas as abas
        buttons.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        // Ativa a aba selecionada
        tabBtn.classList.add('active');
        const activeContent = Array.from(contents).find(content => content.id === tabId + '-tab' || content.id === tabId + '-mode');
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    /**
     * Formata o tempo em formato mm:ss ou hh:mm:ss
     * @param {number} seconds - Tempo em segundos
     * @returns {string} - Tempo formatado
     */
    function formatTime(seconds) {
        if (seconds < 3600) {
            return new Date(seconds * 1000).toISOString().substr(14, 5);
        } else {
            return new Date(seconds * 1000).toISOString().substr(11, 8);
        }
    }

    // ====== Funcionalidades de Text-to-Speech (TTS) ======

    // Variáveis globais de TTS
    const ttsState = {
        synth: window.speechSynthesis,
        voices: [],
        utterance: null,
        selectedVoice: null,
        isPlaying: false,
        isPaused: false
    };

    // Elementos DOM para TTS
    const ttsPlayBtn = document.getElementById('ttsPlayBtn');
    const ttsPauseBtn = document.getElementById('ttsPauseBtn');
    const ttsStopBtn = document.getElementById('ttsStopBtn');
    const ttsRateSlider = document.getElementById('ttsRateSlider');
    const ttsRateValue = document.getElementById('ttsRateValue');
    const ttsVolumeSlider = document.getElementById('ttsVolumeSlider');
    const ttsVolumeValue = document.getElementById('ttsVolumeValue');
    const ttsVoiceSelect = document.getElementById('ttsVoiceSelect');

    /**
     * Inicializa as vozes do TTS
     */
    function initTTS() {
        // Inicializar o objeto de síntese de voz
        ttsState.synth = window.speechSynthesis;

        // Obter vozes disponíveis - pode levar um tempo para carregar
        function loadVoices() {
            ttsState.voices = ttsState.synth.getVoices();
            populateVoiceList();
        }

        // Chamar quando as vozes estiverem carregadas
        if (ttsState.synth.onvoiceschanged !== undefined) {
            ttsState.synth.onvoiceschanged = loadVoices;
        }

        // Tentar carregar vozes imediatamente também
        loadVoices();
    }

    /**
     * Preenche a lista de vozes disponíveis (apenas em português)
     */
    function populateVoiceList() {
        // Limpar lista atual
        ttsVoiceSelect.innerHTML = '';

        // Filtrar apenas vozes em português
        const ptVoices = ttsState.voices.filter(voice => {
            return voice.lang.toLowerCase().includes('pt') || voice.name.toLowerCase().includes('brasil') || voice.name.toLowerCase().includes('portuguese');
        });

        // Se não houver vozes em português, usar todas as vozes
        const voicesToUse = ptVoices.length > 0 ? ptVoices : ttsState.voices;

        // Adicionar vozes à lista
        voicesToUse.forEach(voice => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-voice-uri', voice.voiceURI);
            option.setAttribute('data-lang', voice.lang);
            ttsVoiceSelect.appendChild(option);
        });

        // Selecionar a primeira voz portuguesa, se disponível
        if (ptVoices.length > 0) {
            ttsVoiceSelect.selectedIndex = 0;
            ttsState.selectedVoice = ptVoices[0];
        } else if (ttsState.voices.length > 0) {
            ttsVoiceSelect.selectedIndex = 0;
            ttsState.selectedVoice = ttsState.voices[0];

            // Mostrar aviso se não houver vozes em português
            console.warn('Nenhuma voz em português encontrada. Usando voz padrão.');
        }
    }

    /**
     * Inicia a leitura em voz alta do texto atual
     */
    function playTTS() {
        // Verificar se há texto para ler
        if (appState.words.length === 0 && textInput.value.trim() === '') {
            alert('Por favor, insira um texto para iniciar a leitura em voz alta.');
            return;
        }

        // Interromper qualquer leitura atual
        stopTTS();

        // Criar nova instância de fala
        ttsState.utterance = new SpeechSynthesisUtterance();

        // Texto a ser lido (todo o texto, não só a palavra atual)
        ttsState.utterance.text = textInput.value.trim();

        // Definir voz selecionada
        const selectedOption = ttsVoiceSelect.options[ttsVoiceSelect.selectedIndex];
        const selectedVoiceURI = selectedOption ? selectedOption.getAttribute('data-voice-uri') : null;

        if (selectedVoiceURI) {
            const selectedVoice = ttsState.voices.find(voice => voice.voiceURI === selectedVoiceURI);
            if (selectedVoice) {
                ttsState.utterance.voice = selectedVoice;
                ttsState.selectedVoice = selectedVoice;
            }
        } else if (ttsState.selectedVoice) {
            ttsState.utterance.voice = ttsState.selectedVoice;
        }

        // Configurar parâmetros de fala
        ttsState.utterance.rate = parseFloat(ttsRateSlider.value);
        ttsState.utterance.volume = parseFloat(ttsVolumeSlider.value);
        ttsState.utterance.lang = ttsState.selectedVoice ? ttsState.selectedVoice.lang : 'pt-BR';

        // Manipuladores de eventos
        ttsState.utterance.onstart = () => {
            ttsState.isPlaying = true;
            ttsState.isPaused = false;
            console.log('TTS iniciado.');
        };

        ttsState.utterance.onend = () => {
            ttsState.isPlaying = false;
            ttsState.isPaused = false;
            console.log('TTS finalizado.');
        };

        ttsState.utterance.onerror = (event) => {
            console.error('Erro de TTS:', event.error);

            // Tratamento para erros comuns
            if (event.error === 'interrupted' || event.error === 'canceled') {
                // Ignorar, provavelmente foi cancelado intencionalmente
            } else if (event.error === 'not-allowed') {
                alert('A permissão para usar o Text-to-Speech foi negada pelo navegador.');
            } else if (event.error === 'network') {
                alert('Erro de rede ao carregar vozes. Verifique sua conexão com a internet.');
            } else {
                alert(`Erro ao iniciar Text-to-Speech: ${event.error}`);
            }

            ttsState.isPlaying = false;
            ttsState.isPaused = false;
        };

        // Iniciar a fala com tratamento de erros
        try {
            ttsState.synth.speak(ttsState.utterance);
        } catch (error) {
            console.error('Erro ao iniciar TTS:', error);
            alert('Ocorreu um erro ao iniciar a leitura em voz alta. Tente novamente.');
        }
    }

    /**
     * Pausa ou continua a leitura em voz alta
     */
    function pauseResumeTTS() {
        if (!ttsState.isPlaying) return;

        if (ttsState.isPaused) {
            // Continuar a leitura
            try {
                ttsState.synth.resume();
                ttsState.isPaused = false;
            } catch (error) {
                console.error('Erro ao retomar TTS:', error);
                // Em caso de erro, tentar iniciar novamente
                playTTS();
            }
        } else {
            // Pausar a leitura
            try {
                ttsState.synth.pause();
                ttsState.isPaused = true;
            } catch (error) {
                console.error('Erro ao pausar TTS:', error);
                alert('Não foi possível pausar a leitura. Tente parar e iniciar novamente.');
            }
        }
    }

    /**
     * Interrompe completamente a leitura em voz alta
     */
    function stopTTS() {
        try {
            ttsState.synth.cancel();
            ttsState.isPlaying = false;
            ttsState.isPaused = false;
        } catch (error) {
            console.error('Erro ao parar TTS:', error);
        }
    }

    // Event listeners para TTS
    ttsPlayBtn.addEventListener('click', playTTS);

    ttsPauseBtn.addEventListener('click', pauseResumeTTS);

    ttsStopBtn.addEventListener('click', stopTTS);

    ttsRateSlider.addEventListener('input', () => {
        const value = parseFloat(ttsRateSlider.value);
        ttsRateValue.textContent = value.toFixed(1) + 'x';

        // Se estiver reproduzindo, aplicar imediatamente
        if (ttsState.isPlaying && ttsState.utterance) {
            // Para aplicar a mudança na taxa, precisamos reiniciar a fala
            const currentTime = ttsState.synth.getEstimatedTime ? ttsState.synth.getEstimatedTime() : 0;
            stopTTS();
            ttsState.utterance.rate = value;
            playTTS();

            // Não é possível definir o tempo atual em SpeechSynthesis API
        }
    });

    ttsVolumeSlider.addEventListener('input', () => {
        const value = parseFloat(ttsVolumeSlider.value);
        ttsVolumeValue.textContent = Math.round(value * 100) + '%';

        // Se estiver reproduzindo, aplicar imediatamente
        if (ttsState.isPlaying && ttsState.utterance) {
            ttsState.utterance.volume = value;
        }
    });

    ttsVoiceSelect.addEventListener('change', () => {
        const selectedOption = ttsVoiceSelect.options[ttsVoiceSelect.selectedIndex];
        const selectedVoiceURI = selectedOption ? selectedOption.getAttribute('data-voice-uri') : null;

        if (selectedVoiceURI) {
            const selectedVoice = ttsState.voices.find(voice => voice.voiceURI === selectedVoiceURI);
            if (selectedVoice) {
                ttsState.selectedVoice = selectedVoice;

                // Se estiver reproduzindo, reiniciar com a nova voz
                if (ttsState.isPlaying) {
                    playTTS();
                }
            }
        }
    });

    // ====== Funcionalidades de Leitura Dinâmica ======

    /**
     * Prepara o texto para leitura dinâmica
     * @param {string} text - Texto a ser lido
     */
    function prepareReading(text) {
        if (!text || text.trim() === '') {
            alert('Por favor, insira um texto para iniciar a leitura.');
            return false;
        }

        // Limpar e dividir o texto em palavras
        const cleanText = text.trim()
            .replace(/\s+/g, ' ')
            .replace(/[\r\n]+/g, ' ');

        appState.words = cleanText.split(' ');
        appState.currentWordIndex = 0;
        appState.isReading = false;
        appState.isPaused = true;
        appState.readingStartTime = null;
        appState.readingTime = 0;
        appState.wordsRead = 0;

        updateWordDisplay();
        return true;
    }

    /**
     * Atualiza a exibição das palavras na tela
     */
    function updateWordDisplay() {
        const { currentWordIndex, words } = appState;
        const { prevWords, nextWords } = appConfig;

        // Palavra atual
        const currentWordText = words[currentWordIndex] || '';
        currentWord.textContent = currentWordText;

        // Destacar palavras longas se habilitado
        if (appConfig.highlightLongWords && currentWordText.length > 8) {
            currentWord.classList.add('highlight');
        } else {
            currentWord.classList.remove('highlight');
        }

        // Palavras anteriores
        let prevWordsText = '';
        for (let i = 1; i <= prevWords; i++) {
            const index = currentWordIndex - i;
            if (index >= 0) {
                prevWordsText = words[index] + ' ' + prevWordsText;
            }
        }
        previousWords.textContent = prevWordsText;

        // Próximas palavras
        let nextWordsText = '';
        for (let i = 1; i <= nextWords; i++) {
            const index = currentWordIndex + i;
            if (index < words.length) {
                nextWordsText += words[index] + ' ';
            }
        }
        nextWords.textContent = nextWordsText;
    }

    /**
     * Inicia a leitura dinâmica
     */
    function startReading() {
        if (appState.words.length === 0) return;

        appState.isReading = true;
        appState.isPaused = false;

        // Iniciar temporizador de leitura se ainda não foi iniciado
        if (!appState.readingStartTime) {
            appState.readingStartTime = Date.now();
        }

        // Atualizar ícone do botão de play/pause
        playPauseBtn.innerHTML = '<span class="iconify" data-icon="carbon:pause"></span>';
        playPauseBtn.title = 'Pausar (Espaço)';

        // Tempo entre palavras (ms) com base no WPM (palavras por minuto)
        const wordInterval = 60000 / appConfig.wpm;

        // Limpar intervalo existente
        if (appState.readingInterval) {
            clearInterval(appState.readingInterval);
        }

        // Iniciar novo intervalo
        appState.readingInterval = setInterval(() => {
            nextWord();

            // Se chegamos ao final do texto, parar a leitura
            if (appState.currentWordIndex >= appState.words.length) {
                stopReading();
                completeReading();
            }
        }, wordInterval);
    }

    /**
     * Pausa a leitura dinâmica
     */
    function pauseReading() {
        if (!appState.isReading) return;

        appState.isPaused = true;

        // Limpar intervalo
        if (appState.readingInterval) {
            clearInterval(appState.readingInterval);
            appState.readingInterval = null;
        }

        // Atualizar ícone do botão de play/pause
        playPauseBtn.innerHTML = '<span class="iconify" data-icon="carbon:play"></span>';
        playPauseBtn.title = 'Reproduzir (Espaço)';

        // Atualizar tempo de leitura
        updateReadingTime();
    }

    /**
     * Alterna entre play e pause
     */
    function togglePlayPause() {
        if (appState.isPaused) {
            startReading();
        } else {
            pauseReading();
        }
    }

    /**
     * Avança para a próxima palavra
     */
    function nextWord() {
        if (appState.currentWordIndex < appState.words.length) {
            appState.currentWordIndex++;
            appState.wordsRead++;

            updateWordDisplay();

            // Verificar se deve pausar em pontuação
            if (appConfig.pauseOnPunctuation && appState.isReading) {
                const currentWord = appState.words[appState.currentWordIndex - 1] || '';
                if (/[.!?;:]$/.test(currentWord) && appState.readingInterval) {
                    // Aumentar a pausa para pontuação
                    clearInterval(appState.readingInterval);

                    // Reiniciar após uma pausa maior (1.5x o tempo normal)
                    const wordInterval = 60000 / appConfig.wpm;
                    setTimeout(() => {
                        if (!appState.isPaused) {
                            startReading();
                        }
                    }, wordInterval * 1.5);
                }
            }
        }
    }

    /**
     * Volta para a palavra anterior
     */
    function prevWord() {
        if (appState.currentWordIndex > 0) {
            appState.currentWordIndex--;
            updateWordDisplay();
        }
    }

    /**
     * Reinicia a leitura
     */
    function resetReading() {
        pauseReading();
        appState.currentWordIndex = 0;
        updateWordDisplay();
    }

    /**
     * Para a leitura completamente
     */
    function stopReading() {
        pauseReading();
        appState.isReading = false;
    }

    /**
     * Atualiza o tempo total de leitura
     */
    function updateReadingTime() {
        if (appState.readingStartTime) {
            const currentTime = Date.now();
            appState.readingTime += (currentTime - appState.readingStartTime) / 1000;
            appState.readingStartTime = appState.isPaused ? null : currentTime;
        }
    }

    /**
     * Finaliza uma sessão de leitura e salva estatísticas
     */
    function completeReading() {
        // Atualizar tempo de leitura
        updateReadingTime();

        // Calcular métricas
        const totalWords = appState.words.length;
        const actualWPM = Math.round((appState.wordsRead / appState.readingTime) * 60);

        // Criar objeto de sessão
        const session = {
            date: new Date().toISOString(),
            wordsRead: appState.wordsRead,
            totalWords: totalWords,
            readingTime: appState.readingTime,
            wpm: actualWPM
        };

        // Adicionar à lista de sessões
        appState.sessions.push(session);

        // Salvar no localStorage
        localStorage.setItem('textFocusSessions', JSON.stringify(appState.sessions));

        // Mostrar resumo
        showCompletionMessage(session);
    }

    /**
     * Exibe uma mensagem de conclusão da leitura
     * @param {Object} session - Dados da sessão concluída
     */
    function showCompletionMessage(session) {
        // Atualizar estatísticas
        updateStatistics();

        // Exibir modal de estatísticas com foco na sessão atual
        showModal(statsModal);

        // Selecionar a aba de sessão atual
        const currentStatsTabBtn = Array.from(statsTabBtns).find(btn => btn.dataset.tab === 'current');
        if (currentStatsTabBtn) {
            switchTab(currentStatsTabBtn, statsTabBtns, statsTabContents);
        }
    }

    /**
     * Atualiza a exibição de estatísticas
     */
    function updateStatistics() {
        // Atualizar estatísticas da sessão atual
        document.getElementById('currentWordCount').textContent = appState.wordsRead;
        document.getElementById('currentReadingTime').textContent = formatTime(appState.readingTime);

        const wpm = appState.readingTime > 0 ? Math.round((appState.wordsRead / appState.readingTime) * 60) : 0;
        document.getElementById('currentWPM').textContent = wpm;

        // Atualizar estatísticas totais
        let totalWords = 0;
        let totalTime = 0;

        if (appState.sessions.length > 0) {
            totalWords = appState.sessions.reduce((sum, session) => sum + session.wordsRead, 0);
            totalTime = appState.sessions.reduce((sum, session) => sum + session.readingTime, 0);
        }

        document.getElementById('totalWordCount').textContent = totalWords;
        document.getElementById('totalReadingTime').textContent = formatTime(totalTime);
        document.getElementById('totalSessions').textContent = appState.sessions.length;

        // Atualizar lista de histórico
        updateSessionHistory();
    }

    /**
     * Atualiza a lista de histórico de sessões
     */
    function updateSessionHistory() {
        const sessionHistoryList = document.getElementById('sessionHistoryList');
        sessionHistoryList.innerHTML = '';

        // Ordenar sessões do mais recente para o mais antigo
        const sortedSessions = [...appState.sessions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // Criar elementos HTML para cada sessão
        sortedSessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-history-item';

            const dateObj = new Date(session.date);
            const dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR');

            sessionItem.innerHTML = `
                <div class="session-date">${dateStr}</div>
                <div class="session-details">
                    <span class="session-detail"><strong>Palavras:</strong> ${session.wordsRead}</span>
                    <span class="session-detail"><strong>Tempo:</strong> ${formatTime(session.readingTime)}</span>
                    <span class="session-detail"><strong>Média:</strong> ${session.wpm} PPM</span>
                </div>
            `;

            sessionHistoryList.appendChild(sessionItem);
        });

        // Exibir mensagem se não houver sessões
        if (sortedSessions.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Nenhuma sessão de leitura registrada.';
            sessionHistoryList.appendChild(emptyMessage);
        }
    }

    // ====== Event Listeners ======

    // Botões de modal
    settingsBtn.addEventListener('click', () => showModal(settingsModal));
    statsBtn.addEventListener('click', () => showModal(statsModal));
    iaGenBtn.addEventListener('click', () => showModal(iaModal));

    // Fechar modais
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            hideModal(modal);
        });
    });

    // Clicar fora do modal para fechar
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Alternar abas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn, tabBtns, tabContents));
    });

    settingsTabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn, settingsTabBtns, settingsTabContents));
    });

    statsTabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn, statsTabBtns, statsTabContents));
    });

    aiModeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn, aiModeBtns, aiModeContents));
    });

    // Alternar temas
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            saveConfig();
        });
    });

    // Controle de leitura
    startReadingBtn.addEventListener('click', () => {
        if (prepareReading(textInput.value)) {
            // Mostrar seção de leitura
            readerSection.style.display = 'block';

            // Iniciar leitura
            startReading();
        }
    });

    clearTextBtn.addEventListener('click', () => {
        textInput.value = '';
    });

    // Atualização de valores de controles deslizantes
    wpmSlider.addEventListener('input', () => {
        const value = wpmSlider.value;
        wpmValue.textContent = value;
        appConfig.wpm = parseInt(value);
        saveConfig();
    });

    // Salvar configurações
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        // Atualizar todas as configurações com base nos valores da UI

        // Fonte e aparência
        appConfig.font = document.getElementById('fontSelect').value;
        appConfig.fontSize = parseInt(document.getElementById('fontSizeSlider').value);
        appConfig.enableAnimations = document.getElementById('enableAnimations').checked;

        // Leitura
        appConfig.prevWords = parseInt(document.getElementById('prevWordsSlider').value);
        appConfig.nextWords = parseInt(document.getElementById('nextWordsSlider').value);
        appConfig.wpm = parseInt(document.getElementById('defaultWpmSlider').value);
        appConfig.highlightLongWords = document.getElementById('highlightLongWords').checked;
        appConfig.pauseOnPunctuation = document.getElementById('pauseOnPunctuation').checked;

        // Áudio
        appConfig.enableTTS = document.getElementById('enableTTS').checked;
        appConfig.ttsRate = parseFloat(document.getElementById('defaultTTSRateSlider').value);
        appConfig.enableLofi = document.getElementById('enableLofi').checked;
        appConfig.enableAmbientSounds = document.getElementById('enableAmbientSounds').checked;
        appConfig.rememberAudioSettings = document.getElementById('rememberAudioSettings').checked;

        // IA
        appConfig.apiKey = document.getElementById('apiKeyInput').value;
        appConfig.apiModel = document.getElementById('apiModelSelect').value;
        appConfig.aiTemperature = parseFloat(document.getElementById('aiTempSlider').value);
        appConfig.aiMaxTokens = parseInt(document.getElementById('aiMaxTokensSlider').value);

        saveConfig();
        applyConfig();
        hideModal(settingsModal);
    });

    document.getElementById('resetSettingsBtn').addEventListener('click', () => {
        // Resetar para as configurações padrão
        const defaultConfig = {
            theme: 'light',
            font: 'Inter',
            fontSize: 16,
            enableAnimations: true,

            prevWords: 1,
            nextWords: 1,
            wpm: 300,
            highlightLongWords: true,
            pauseOnPunctuation: true,

            enableTTS: true,
            ttsRate: 1.0,
            ttsVolume: 1.0,
            enableLofi: true,
            enableAmbientSounds: true,
            rememberAudioSettings: true,

            apiKey: '',
            apiModel: 'llama3-70b-8192',
            aiTemperature: 0.7,
            aiMaxTokens: 1000
        };

        Object.assign(appConfig, defaultConfig);
        saveConfig();
        applyConfig();
    });

    // Atualizar valores em tempo real dos controles deslizantes
    document.getElementById('fontSizeSlider').addEventListener('input', () => {
        document.getElementById('fontSizeValue').textContent = document.getElementById('fontSizeSlider').value + 'px';
    });

    document.getElementById('prevWordsSlider').addEventListener('input', () => {
        document.getElementById('prevWordsValue').textContent = document.getElementById('prevWordsSlider').value;
    });

    document.getElementById('nextWordsSlider').addEventListener('input', () => {
        document.getElementById('nextWordsValue').textContent = document.getElementById('nextWordsSlider').value;
    });

    document.getElementById('defaultWpmSlider').addEventListener('input', () => {
        document.getElementById('defaultWpmValue').textContent = document.getElementById('defaultWpmSlider').value + ' PPM';
    });

    document.getElementById('defaultTTSRateSlider').addEventListener('input', () => {
        document.getElementById('defaultTTSRateValue').textContent = parseFloat(document.getElementById('defaultTTSRateSlider').value).toFixed(1) + 'x';
    });

    document.getElementById('aiTempSlider').addEventListener('input', () => {
        document.getElementById('aiTempValue').textContent = document.getElementById('aiTempSlider').value;
    });

    document.getElementById('aiMaxTokensSlider').addEventListener('input', () => {
        document.getElementById('aiMaxTokensValue').textContent = document.getElementById('aiMaxTokensSlider').value + ' tokens';
    });

    document.getElementById('essayLinesRange').addEventListener('input', () => {
        document.getElementById('essayLinesValue').textContent = document.getElementById('essayLinesRange').value + ' linhas';
    });

    // ====== Funcionalidades de Áudio (LoFi e Sons Ambiente) ======

    // Elementos DOM para LoFi
    const lofiPlayBtn = document.getElementById('lofiPlayBtn');
    const lofiPauseBtn = document.getElementById('lofiPauseBtn');
    const lofiStopBtn = document.getElementById('lofiStopBtn');
    const lofiVolumeSlider = document.getElementById('lofiVolumeSlider');
    const lofiVolumeValue = document.getElementById('lofiVolumeValue');
    const lofiTrackSelect = document.getElementById('lofiTrackSelect');

    // Elementos DOM para sons ambiente
    const ambientBtns = document.querySelectorAll('.ambient-btn');
    const ambientVolumes = document.querySelectorAll('.ambient-volume');
    const muteAllAmbientBtn = document.getElementById('muteAllAmbientBtn');

    // URLs dos sons ambiente
    const ambientSoundUrls = {
        rain: 'https://www.soundjay.com/nature/sounds/rain-01.mp3', // Alternativa para chuva
        fire: 'https://www.soundjay.com/nature/sounds/campfire-1.mp3', // Alternativa para lareira
        forest: 'https://www.soundjay.com/nature/sounds/windy-forest-ambience-01.mp3', // Alternativa para floresta
        cafe: 'https://www.soundjay.com/appliances/sounds/coffee-maker-1.mp3', // Alternativa para café
        ocean: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3', // Alternativa para oceano
        bus: 'https://www.soundjay.com/transportation/sounds/bus-driving-interior-ambience-01.mp3' // Alternativa para oceano
    };

    /**
     * Inicializa o player de LoFi e sons ambiente
     */
    function initAudioPlayers() {
        // Inicializar o player LoFi
        appState.lofiAudio = new Audio();
        appState.lofiAudio.volume = parseFloat(lofiVolumeSlider.value);
        appState.lofiAudio.loop = true;

        // Inicializar os players de sons ambiente
        ambientBtns.forEach(btn => {
            const soundType = btn.dataset.sound;
            if (soundType && ambientSoundUrls[soundType]) {
                // Criar elemento de áudio
                const audio = new Audio(ambientSoundUrls[soundType]);
                audio.loop = true;
                audio.volume = 0.5; // Volume padrão

                // Armazenar no estado
                appState.ambientSounds[soundType] = {
                    audio: audio,
                    isPlaying: false,
                    volume: 0.5
                };
            }
        });

        // Configurar volume com base nos sliders
        updateAmbientVolumes();
    }

    /**
     * Reproduz a música LoFi selecionada
     */
    function playLofi() {
        // Verificar se há um player LoFi
        if (!appState.lofiAudio) return;

        // Obter a URL selecionada
        const selectedTrackUrl = lofiTrackSelect.value;

        // Se a música atual é diferente da selecionada, carregar nova música
        if (appState.lofiAudio.src !== selectedTrackUrl) {
            appState.lofiAudio.src = selectedTrackUrl;
        }

        // Reproduzir com tratamento de erros
        try {
            const playPromise = appState.lofiAudio.play();

            // O play() retorna uma Promise em navegadores modernos
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Erro ao reproduzir LoFi:', error);

                    // Se o erro for devido à interação do usuário, mostrar mensagem
                    if (error.name === 'NotAllowedError') {
                        alert('O navegador bloqueou a reprodução automática. Por favor, clique novamente no botão para reproduzir.');
                    } else {
                        alert('Erro ao reproduzir música LoFi. Verifique a URL e tente novamente.');
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao iniciar LoFi:', error);
        }
    }

    /**
     * Pausa a música LoFi
     */
    function pauseLofi() {
        if (!appState.lofiAudio) return;

        try {
            appState.lofiAudio.pause();
        } catch (error) {
            console.error('Erro ao pausar LoFi:', error);
        }
    }

    /**
     * Para a música LoFi completamente
     */
    function stopLofi() {
        if (!appState.lofiAudio) return;

        try {
            appState.lofiAudio.pause();
            appState.lofiAudio.currentTime = 0;
        } catch (error) {
            console.error('Erro ao parar LoFi:', error);
        }
    }

    /**
     * Reproduz ou pausa um som ambiente
     * @param {string} soundType - Tipo de som ambiente
     */
    function toggleAmbientSound(soundType) {
        const soundState = appState.ambientSounds[soundType];

        if (!soundState || !soundState.audio) return;

        if (soundState.isPlaying) {
            // Pausar som
            try {
                soundState.audio.pause();
                soundState.isPlaying = false;
            } catch (error) {
                console.error(`Erro ao pausar som ambiente ${soundType}:`, error);
            }
        } else {
            // Reproduzir som
            try {
                const playPromise = soundState.audio.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error(`Erro ao reproduzir som ambiente ${soundType}:`, error);

                        if (error.name === 'NotAllowedError') {
                            alert('O navegador bloqueou a reprodução automática. Por favor, clique novamente no botão para reproduzir.');
                        }
                    });
                }

                soundState.isPlaying = true;
            } catch (error) {
                console.error(`Erro ao iniciar som ambiente ${soundType}:`, error);
            }
        }

        // Atualizar interface
        updateAmbientButtonStates();
    }

    /**
     * Atualiza o estado visual dos botões de sons ambiente
     */
    function updateAmbientButtonStates() {
        ambientBtns.forEach(btn => {
            const soundType = btn.dataset.sound;
            const soundState = appState.ambientSounds[soundType];

            if (soundState && soundState.isPlaying) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Atualiza o volume dos sons ambiente com base nos sliders
     */
    function updateAmbientVolumes() {
        ambientVolumes.forEach((volumeSlider, index) => {
            const btn = ambientBtns[index];
            if (!btn) return;

            const soundType = btn.dataset.sound;
            const soundState = appState.ambientSounds[soundType];

            if (soundState && soundState.audio) {
                const volume = parseFloat(volumeSlider.value);
                soundState.audio.volume = volume;
                soundState.volume = volume;
            }
        });
    }

    /**
     * Silencia todos os sons ambiente
     */
    function muteAllAmbientSounds() {
        for (const soundType in appState.ambientSounds) {
            const soundState = appState.ambientSounds[soundType];

            if (soundState && soundState.audio && soundState.isPlaying) {
                try {
                    soundState.audio.pause();
                    soundState.isPlaying = false;
                } catch (error) {
                    console.error(`Erro ao pausar som ambiente ${soundType}:`, error);
                }
            }
        }

        // Atualizar interface
        updateAmbientButtonStates();
    }

    // Event listeners para LoFi
    lofiPlayBtn.addEventListener('click', playLofi);
    lofiPauseBtn.addEventListener('click', pauseLofi);
    lofiStopBtn.addEventListener('click', stopLofi);

    lofiVolumeSlider.addEventListener('input', () => {
        const value = parseFloat(lofiVolumeSlider.value);
        lofiVolumeValue.textContent = Math.round(value * 100) + '%';

        if (appState.lofiAudio) {
            appState.lofiAudio.volume = value;
        }
    });

    lofiTrackSelect.addEventListener('change', () => {
        // Se já estava tocando, trocar a música e continuar tocando
        const wasPlaying = appState.lofiAudio && !appState.lofiAudio.paused;

        if (wasPlaying) {
            stopLofi();
            playLofi();
        }
    });

    // Event listeners para sons ambiente
    ambientBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const soundType = btn.dataset.sound;
            toggleAmbientSound(soundType);
        });
    });

    ambientVolumes.forEach(volumeSlider => {
        volumeSlider.addEventListener('input', updateAmbientVolumes);
    });

    muteAllAmbientBtn.addEventListener('click', muteAllAmbientSounds);

    // ====== Funcionalidades de IA ======

    // Elementos DOM para IA
    const generateAiTextBtn = document.getElementById('generateAiTextBtn');
    const aiStatus = document.getElementById('aiStatus');
    const aiStatusText = document.getElementById('aiStatusText');
    const freePromptInput = document.getElementById('freePromptInput');
    const essayTopicInput = document.getElementById('essayTopicInput');
    const essayToneSelect = document.getElementById('essayToneSelect');
    const essayLinesRange = document.getElementById('essayLinesRange');
    const essayStyleSelect = document.getElementById('essayStyleSelect');
    const qaQuestionInput = document.getElementById('qaQuestionInput');
    const qaFormatRadios = document.querySelectorAll('input[name="qaFormat"]');

    /**
     * Processa o prompt com base no modo selecionado
     * @returns {string} - Prompt processado
     */
    function processPrompt() {
        // Identificar qual modo está ativo
        const activeMode = document.querySelector('.ai-mode-btn.active').dataset.mode;

        let finalPrompt = '';

        switch (activeMode) {
            case 'free':
                // Modo livre - usar o prompt diretamente
                finalPrompt = freePromptInput.value.trim();
                break;

            case 'essay':
                // Modo redação - construir prompt baseado nas opções
                const topic = essayTopicInput.value.trim();
                const tone = essayToneSelect.value;
                const lines = essayLinesRange.value;
                const style = essayStyleSelect.value;

                if (!topic) {
                    alert('Por favor, insira um tema para a redação.');
                    return null;
                }

                finalPrompt = `Escreva uma redação sobre "${topic}".
                    Use um tom ${tone} e um estilo ${style}.
                    A redação deve ter aproximadamente ${lines} parágrafos.
                    Escreva de forma natural e fluente em português do Brasil.`;
                break;

            case 'qa':
                // Modo perguntas e respostas
                const question = qaQuestionInput.value.trim();
                const format = document.querySelector('input[name="qaFormat"]:checked').value;

                if (!question) {
                    alert('Por favor, insira uma pergunta.');
                    return null;
                }

                if (format === 'numbered') {
                    finalPrompt = `Responda à seguinte pergunta: "${question}".
                        Formate sua resposta como uma lista numerada de pontos importantes.
                        Responda de forma completa em português do Brasil.`;
                } else {
                    finalPrompt = `Responda à seguinte pergunta: "${question}".
                        Formate sua resposta como um texto contínuo e bem estruturado.
                        Responda de forma completa em português do Brasil.`;
                }
                break;

            default:
                alert('Modo não reconhecido. Por favor, selecione um modo válido.');
                return null;
        }

        return finalPrompt;
    }

    /**
     * Gera texto usando a API do Groq
     */
    async function generateAiText() {
        // Verificar se a chave da API está configurada
        if (!appConfig.apiKey) {
            alert('Por favor, configure uma chave da API nas configurações antes de usar esta funcionalidade.');
            showModal(settingsModal);

            // Selecionar a aba de IA nas configurações
            const aiSettingsTab = Array.from(settingsTabBtns).find(btn => btn.dataset.tab === 'ai');
            if (aiSettingsTab) {
                switchTab(aiSettingsTab, settingsTabBtns, settingsTabContents);
            }

            return;
        }

        // Processar o prompt
        const prompt = processPrompt();
        if (!prompt) return; // Cancelar se o prompt não for válido

        // Atualizar interface para mostrar que está carregando
        aiStatus.classList.add('loading');
        aiStatusText.textContent = 'Gerando texto...';
        generateAiTextBtn.disabled = true;

        try {
            // Fazer requisição para a API Groq
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: appConfig.apiModel,
                    messages: [
                        {
                            role: 'system',
                            content: 'Você é um assistente útil que escreve textos de alta qualidade em português do Brasil. Seja conciso, claro e natural.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: appConfig.aiTemperature,
                    max_tokens: appConfig.aiMaxTokens
                })
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Extrair o texto gerado
            const generatedText = data.choices[0]?.message?.content || 'Não foi possível gerar texto.';

            // Inserir o texto gerado no campo de texto
            textInput.value = generatedText;

            // Preparar para leitura
            prepareReading(generatedText);
            readerSection.style.display = 'block';

            // Atualizar status
            aiStatus.classList.remove('loading');
            aiStatus.classList.add('success');
            aiStatusText.textContent = 'Texto gerado com sucesso!';

            // Fechar o modal de IA após um breve momento
            setTimeout(() => {
                hideModal(iaModal);
                aiStatus.classList.remove('success');
                aiStatusText.textContent = 'Pronto para gerar texto';
            }, 1500);

        } catch (error) {
            console.error('Erro ao gerar texto com IA:', error);

            // Atualizar status para erro
            aiStatus.classList.remove('loading');
            aiStatus.classList.add('error');
            aiStatusText.textContent = 'Erro: ' + (error.message || 'Falha na geração de texto');

            // Se for erro de chave inválida, sugerir atualização da chave
            if (error.message && (error.message.includes('401') || error.message.includes('auth'))) {
                alert('Chave da API inválida ou expirada. Por favor, verifique suas configurações.');

                // Abrir configurações na aba de IA
                showModal(settingsModal);
                const aiSettingsTab = Array.from(settingsTabBtns).find(btn => btn.dataset.tab === 'ai');
                if (aiSettingsTab) {
                    switchTab(aiSettingsTab, settingsTabBtns, settingsTabContents);
                }
            } else {
                alert('Erro ao gerar texto com IA: ' + error.message);
            }
        } finally {
            // Reativar botão
            generateAiTextBtn.disabled = false;
        }
    }

    // Event listeners para IA
    generateAiTextBtn.addEventListener('click', generateAiText);

    // Atualizar contador de linhas para redação
    essayLinesRange.addEventListener('input', () => {
        document.getElementById('essayLinesValue').textContent = essayLinesRange.value + ' linhas';
    });

    // Salvar chave de API
    document.getElementById('saveApiSettingsBtn').addEventListener('click', () => {
        appConfig.apiKey = document.getElementById('apiKeyInput').value;
        appConfig.apiModel = document.getElementById('apiModelSelect').value;
        appConfig.aiTemperature = parseFloat(document.getElementById('aiTempSlider').value);
        appConfig.aiMaxTokens = parseInt(document.getElementById('aiMaxTokensSlider').value);

        saveConfig();

        alert('Configurações da API salvas com sucesso!');
    });

    // ====== Funcionalidades de Estatísticas ======

    /**
     * Inicializa os gráficos de estatísticas usando Chart.js
     */
    function initCharts() {
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            // Carregar Chart.js dinamicamente
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = createCharts;
            document.head.appendChild(script);
        } else {
            createCharts();
        }
    }

    /**
     * Cria os gráficos de estatísticas
     */
    function createCharts() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está disponível.');
            return;
        }

        // Destruir gráficos existentes
        if (window.sessionChart) window.sessionChart.destroy();
        if (window.historyChart) window.historyChart.destroy();

        // Criar dados para o gráfico da sessão atual
        const sessionCtx = document.getElementById('sessionChart').getContext('2d');
        window.sessionChart = new Chart(sessionCtx, {
            type: 'bar',
            data: {
                labels: ['Palavras Lidas'],
                datasets: [{
                    label: 'Sessão Atual',
                    data: [appState.wordsRead],
                    backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Criar dados para o gráfico de histórico
        const historyCtx = document.getElementById('historyChart').getContext('2d');

        // Obter os últimos 7 dias de sessões
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            last7Days.push(date);
        }

        // Formatar datas para labels
        const dateLabels = last7Days.map(date => {
            return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });
        });

        // Agrupar sessões por dia
        const sessionsByDay = last7Days.map(date => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            return appState.sessions.filter(session => {
                const sessionDate = new Date(session.date);
                return sessionDate >= date && sessionDate < nextDay;
            });
        });

        // Calcular total de palavras por dia
        const wordsByDay = sessionsByDay.map(sessions => {
            return sessions.reduce((sum, session) => sum + session.wordsRead, 0);
        });

        window.historyChart = new Chart(historyCtx, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [{
                    label: 'Palavras Lidas por Dia',
                    data: wordsByDay,
                    fill: true,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Mostre o modal de estatísticas quando clicar no botão
    statsBtn.addEventListener('click', () => {
        showModal(statsModal);
        updateStatistics(); // Atualizar estatísticas ao abrir o modal
    });

    // ====== Inicialização ======
    function init() {
        // Carregar configurações
        loadConfig();

        // Carregar dados de sessão
        const savedSessions = localStorage.getItem('textFocusSessions');
        if (savedSessions) {
            appState.sessions = JSON.parse(savedSessions);
        }

        // Inicializar TTS
        initTTS();

        // Inicializar players de áudio
        initAudioPlayers();

        // Inicializar gráficos para estatísticas
        initCharts();

        // Esconder inicialmente a seção de leitura até iniciar
        readerSection.style.display = 'none';

        // Verificar se já existe texto no input ao carregar a página
        if (textInput.value.trim() !== '') {
            prepareReading(textInput.value);
            readerSection.style.display = 'block';
        }

        // Verificar tema atual
        document.body.dataset.theme = appConfig.theme;

        // Configurar evento para mostrar atalhos ao pressionar Tab
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                if (!appState.showShortcuts) {
                    showShortcutsOverlay();
                    appState.showShortcuts = true;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Tab') {
                hideShortcutsOverlay();
                appState.showShortcuts = false;
            }
        });

        console.log('Text Focus inicializado com sucesso!');
    }

    // Iniciar aplicação
    init();

    // Controles do leitor
    playPauseBtn.addEventListener('click', togglePlayPause);
    resetBtn.addEventListener('click', resetReading);
    nextBtn.addEventListener('click', () => {
        pauseReading();
        nextWord();
    });
    prevBtn.addEventListener('click', () => {
        pauseReading();
        prevWord();
    });

    // Controle de teclado para navegação
    document.addEventListener('keydown', (e) => {
        // Somente se tiver texto para ler
        if (appState.words.length === 0) return;

        switch (e.key) {
            case ' ':  // Espaço
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowRight':  // Seta direita
                e.preventDefault();
                pauseReading();
                nextWord();
                break;
            case 'ArrowLeft':  // Seta esquerda
                e.preventDefault();
                pauseReading();
                prevWord();
                break;
            case 'Escape':  // Esc
                e.preventDefault();
                resetReading();
                break;
            case 'ArrowUp':  // Seta para cima
                e.preventDefault();
                // Aumentar velocidade
                wpmSlider.value = Math.min(parseInt(wpmSlider.value) + 10, wpmSlider.max);
                wpmValue.textContent = wpmSlider.value;
                appConfig.wpm = parseInt(wpmSlider.value);
                if (!appState.isPaused) {
                    pauseReading();
                    startReading();
                }
                break;
            case 'ArrowDown':  // Seta para baixo
                e.preventDefault();
                // Diminuir velocidade
                wpmSlider.value = Math.max(parseInt(wpmSlider.value) - 10, wpmSlider.min);
                wpmValue.textContent = wpmSlider.value;
                appConfig.wpm = parseInt(wpmSlider.value);
                if (!appState.isPaused) {
                    pauseReading();
                    startReading();
                }
                break;
            case 'Tab':  // Tab
                // Não mostrar diretamente os atalhos, apenas quando segurado
                break;
        }
    });

    // Mostrar atalhos ao segurar Tab
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (!appState.showShortcuts) {
                showShortcutsOverlay();
                appState.showShortcuts = true;
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Tab') {
            hideShortcutsOverlay();
            appState.showShortcuts = false;
        }
    });

    /**
     * Mostra o overlay de atalhos de teclado
     */
    function showShortcutsOverlay() {
        // Criar overlay de atalhos se não existir
        let shortcutsOverlay = document.getElementById('shortcutsOverlay');

        if (!shortcutsOverlay) {
            shortcutsOverlay = document.createElement('div');
            shortcutsOverlay.id = 'shortcutsOverlay';
            shortcutsOverlay.className = 'shortcuts-overlay';

            const shortcutsContainer = document.createElement('div');
            shortcutsContainer.className = 'shortcuts-container';

            shortcutsContainer.innerHTML = `
                <h2>Atalhos de Teclado</h2>
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <span class="shortcut-action">Play/Pause</span>
                        <span class="shortcut-key">Espaço</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-action">Próxima palavra</span>
                        <span class="shortcut-key">→</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-action">Palavra anterior</span>
                        <span class="shortcut-key">←</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-action">Reiniciar</span>
                        <span class="shortcut-key">ESC</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-action">Aumentar velocidade</span>
                        <span class="shortcut-key">↑</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-action">Diminuir velocidade</span>
                        <span class="shortcut-key">↓</span>
                    </div>
                </div>
            `;

            shortcutsOverlay.appendChild(shortcutsContainer);
            document.body.appendChild(shortcutsOverlay);
        }

        // Mostrar overlay
        shortcutsOverlay.classList.add('visible');
    }

    /**
     * Esconde o overlay de atalhos de teclado
     */
    function hideShortcutsOverlay() {
        const shortcutsOverlay = document.getElementById('shortcutsOverlay');
        if (shortcutsOverlay) {
            shortcutsOverlay.classList.remove('visible');
        }
    }
});

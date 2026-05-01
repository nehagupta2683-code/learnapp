const app = {
    currentLanguage: '',
    currentLevel: '',
    currentTutor: 'Learna',
    isRecording: false,
    isVideoCallActive: false,
    keyboardMode: false,
    recognition: null,
    synth: window.speechSynthesis,

    init() {
        this.bindEvents();
        this.initSpeech();
    },

    initSpeech() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processUserMessage(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                this.stopRecording();
            };
            
            this.recognition.onend = () => {
                this.stopRecording();
            };
        }
    },

    bindEvents() {
        // Bottom Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.target;
                this.navigateMain(target);
                
                // Update active state
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Enter key for chat
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    },

    // --- Onboarding Flow ---
    selectLanguage(lang) {
        this.currentLanguage = lang;
        document.querySelector('.logo-large').classList.add('hidden');
        document.querySelector('.options-list').parentElement.classList.add('hidden');
        document.getElementById('level-selection').classList.remove('hidden');
    },

    completeOnboarding(level) {
        this.currentLevel = level;
        document.getElementById('level-selection').classList.add('hidden');
        document.getElementById('building-plan').classList.remove('hidden');

        // Simulate AI building plan
        setTimeout(() => {
            document.getElementById('onboarding-view').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            this.navigateMain('home-view');
        }, 2000);
    },

    // --- Navigation ---
    navigateMain(viewId) {
        document.querySelectorAll('.main-view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewId).classList.add('active');
    },

    // --- Lessons & Modals ---
    openLessonModal(title) {
        document.getElementById('lesson-title').innerText = title;
        document.getElementById('lesson-modal').classList.remove('hidden');
    },
    
    closeModal() {
        document.getElementById('lesson-modal').classList.add('hidden');
    },

    startLesson() {
        this.closeModal();
        this.startPractice('Learna', 'Default');
    },

    // --- Practice / Chat Area ---
    startPractice(tutorName, style) {
        this.currentTutor = tutorName;
        document.getElementById('active-tutor-name').innerText = tutorName;
        
        // Image setup
        let imgUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'; // Default Learna
        if (tutorName === 'Mateo') imgUrl = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80';
        if (tutorName === 'Sofia') imgUrl = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80';
        
        document.getElementById('call-tutor-img').src = imgUrl;

        // Reset Chat
        const chatArea = document.getElementById('chat-messages');
        chatArea.innerHTML = `
            <div class="message ai-message fade-in-up">
                <p>¡Hola! Ready to practice your ${this.currentLanguage || 'Spanish'}? How are you today?</p>
                <button class="msg-audio-btn"><i class="fa-solid fa-volume-high"></i></button>
            </div>
        `;

        document.getElementById('chat-view').classList.remove('hidden');
    },

    closePractice() {
        document.getElementById('chat-view').classList.add('hidden');
        if (this.isVideoCallActive) {
            this.toggleVideoCall(); // turn off video call if active
        }
    },

    // --- Input Switching ---
    toggleKeyboard() {
        this.keyboardMode = !this.keyboardMode;
        const micContainer = document.querySelector('.mic-container');
        const textContainer = document.getElementById('text-input-container');
        
        if (this.keyboardMode) {
            micContainer.classList.add('hidden');
            textContainer.classList.remove('hidden');
            document.getElementById('message-input').focus();
        } else {
            micContainer.classList.remove('hidden');
            textContainer.classList.add('hidden');
        }
    },

    // --- Recording Logic ---
    startRecording() {
        if (!this.recognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        this.isRecording = true;
        const recordBtn = document.getElementById('record-btn');
        recordBtn.classList.add('recording');
        document.querySelector('.hold-text').innerText = "Listening...";
        
        // Set language based on user's selected language
        if (this.currentLanguage === 'Spanish') this.recognition.lang = 'es-ES';
        else if (this.currentLanguage === 'French') this.recognition.lang = 'fr-FR';
        else if (this.currentLanguage === 'German') this.recognition.lang = 'de-DE';
        else this.recognition.lang = 'en-US';
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error(e);
        }
    },

    stopRecording() {
        if (!this.isRecording) return;
        this.isRecording = false;
        
        const recordBtn = document.getElementById('record-btn');
        recordBtn.classList.remove('recording');
        document.querySelector('.hold-text').innerText = "Hold to speak";
        
        if (this.recognition) {
            this.recognition.stop();
        }
    },

    sendMessage() {
        const input = document.getElementById('message-input');
        const msg = input.value.trim();
        if (msg) {
            this.processUserMessage(msg);
            input.value = '';
        }
    },

    processUserMessage(text) {
        const chatArea = document.getElementById('chat-messages');
        
        // 1. Add user message
        chatArea.insertAdjacentHTML('beforeend', `
            <div class="message user-message fade-in-up">
                <p>${text}</p>
            </div>
        `);
        this.scrollToBottom();

        // 2. Simulate AI Processing
        document.querySelector('.status-text').innerText = "Typing...";

        setTimeout(() => {
            // 3. Simulated Feedback (Grammar + Pronunciation)
            if (text.toLowerCase().includes('bueno')) {
                chatArea.insertAdjacentHTML('beforeend', `
                    <div class="feedback-box fade-in-up">
                        <div class="feedback-header">
                            <span><i class="fa-solid fa-wand-magic-sparkles"></i> Correction</span>
                            <span class="pronunciation-score">Pronunciation: 85%</span>
                        </div>
                        <p style="color:var(--text-secondary); font-size: 0.9rem;">
                            <del style="color:var(--error)">Yo soy bueno</del> 
                            <i class="fa-solid fa-arrow-right mx-2"></i> 
                            <ins style="color:var(--success)">Yo estoy bien</ins>
                        </p>
                        <p style="font-size: 0.8rem; margin-top: 5px; color: #cbd5e1;">Use 'estoy bien' for temporary feelings.</p>
                    </div>
                `);
            } else {
                 chatArea.insertAdjacentHTML('beforeend', `
                    <div class="feedback-box fade-in-up">
                         <div class="feedback-header">
                            <span class="text-green"><i class="fa-solid fa-check-circle"></i> Perfect Syntax</span>
                            <span class="pronunciation-score">Pronunciation: 92%</span>
                        </div>
                    </div>
                 `);
            }

            // 4. AI Response
            setTimeout(() => {
                let aiResponseText = "¡Muy bien! Sigue practicando.";
                if (text.toLowerCase().includes('hola')) aiResponseText = "¡Hola! Qué gusto escucharte.";
                
                chatArea.insertAdjacentHTML('beforeend', `
                    <div class="message ai-message fade-in-up">
                        <p>${aiResponseText}</p>
                        <button class="msg-audio-btn" onclick="app.speakText('${aiResponseText}')"><i class="fa-solid fa-volume-high"></i></button>
                    </div>
                `);
                document.querySelector('.status-text').innerText = "Online";
                this.scrollToBottom();
                
                // Trigger Text-to-Speech
                this.speakText(aiResponseText);
                
                if (this.isVideoCallActive) {
                    document.getElementById('live-transcript').innerText = aiResponseText;
                }
            }, 1000);

        }, 1500);
    },

    speakText(text) {
        if (this.synth) {
            // Cancel any ongoing speech
            this.synth.cancel();
            
            const utterThis = new SpeechSynthesisUtterance(text);
            
            // Set language based on selected language
            if (this.currentLanguage === 'Spanish') utterThis.lang = 'es-ES';
            else if (this.currentLanguage === 'French') utterThis.lang = 'fr-FR';
            else if (this.currentLanguage === 'German') utterThis.lang = 'de-DE';
            else utterThis.lang = 'es-ES'; // Default fallback
            
            // Adjust voice characteristics based on tutor persona
            if (this.currentTutor === 'Mateo') {
                utterThis.pitch = 0.8;
                utterThis.rate = 1.2;
            } else if (this.currentTutor === 'Sofia') {
                utterThis.pitch = 1.2;
                utterThis.rate = 0.9;
            } else {
                utterThis.pitch = 1;
                utterThis.rate = 1;
            }
            
            // Trigger visual wave animation
            this.simulateSpeakingWave();
            
            // Stop wave when done speaking
            utterThis.onend = () => {
                const wave = document.getElementById('ai-speaking-wave');
                if (wave) wave.classList.remove('active');
            };

            this.synth.speak(utterThis);
        }
    },

    scrollToBottom() {
        const chatArea = document.getElementById('chat-messages');
        chatArea.scrollTop = chatArea.scrollHeight;
    },

    // --- Video Call Logic ---
    toggleVideoCall() {
        this.isVideoCallActive = !this.isVideoCallActive;
        const callUI = document.getElementById('video-call-ui');
        const chatArea = document.getElementById('chat-messages');
        const inputArea = document.getElementById('chat-input-area');
        
        if (this.isVideoCallActive) {
            callUI.classList.remove('hidden');
            chatArea.classList.add('hidden');
            inputArea.classList.add('hidden');
            this.simulateSpeakingWave();
        } else {
            callUI.classList.add('hidden');
            chatArea.classList.remove('hidden');
            inputArea.classList.remove('hidden');
        }
    },

    simulateSpeakingWave() {
        const wave = document.getElementById('ai-speaking-wave');
        if (wave) wave.classList.add('active');
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
    
    // Prevent context menu on hold-to-record
    document.getElementById('record-btn').addEventListener('contextmenu', e => e.preventDefault());
});

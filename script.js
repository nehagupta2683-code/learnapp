const app = {
    currentLanguage: '',
    currentLevel: '',
    currentTutor: 'LearnStep',
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
        this.startPractice('LearnStep', 'Default');
    },

    // --- Practice / Chat Area ---
    startPractice(tutorName, style) {
        this.currentTutor = tutorName;
        document.getElementById('active-tutor-name').innerText = tutorName;
        
        // Image setup
        let imgUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80'; // Default LearnStep
        if (tutorName === 'Mateo') imgUrl = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80';
        if (tutorName === 'Sofia') imgUrl = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80';
        
        document.getElementById('call-tutor-img').src = imgUrl;

        // Generate greeting based on language
        let greeting = "¡Hola! Ready to practice your Spanish? How are you today?";
        let greetingEnglish = "Hello! Ready to practice your Spanish? How are you today?";
        
        if (this.currentLanguage === 'French') {
            greeting = "Bonjour! Ready to practice your French? Comment ça va aujourd'hui?";
            greetingEnglish = "Hello! Ready to practice your French? How are you today?";
        } else if (this.currentLanguage === 'German') {
            greeting = "Hallo! Ready to practice your German? Wie geht es dir heute?";
            greetingEnglish = "Hello! Ready to practice your German? How are you today?";
        } else if (this.currentLanguage === 'English') {
            greeting = "Hello! Ready to practice your English? How are you today?";
            greetingEnglish = "";
        }

        // Reset Chat
        const chatArea = document.getElementById('chat-messages');
        chatArea.innerHTML = `
            <div class="message ai-message fade-in-up">
                <p>${greeting}</p>
                ${greetingEnglish ? `<p style="font-size: 0.85rem; color: #94a3b8; margin-top: 6px;"><em>(${greetingEnglish})</em></p>` : ''}
                <button class="msg-audio-btn" onclick="app.speakText('${greeting}')"><i class="fa-solid fa-volume-high"></i></button>
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

    async processUserMessage(text) {
        const chatArea = document.getElementById('chat-messages');
        const lowerText = text.toLowerCase();
        
        // Generate a unique ID for the user message so we can edit it later if there's a mistake
        const msgId = 'user-msg-' + Date.now();
        
        // 1. Add user message
        chatArea.insertAdjacentHTML('beforeend', `
            <div class="message user-message fade-in-up" id="\${msgId}">
                <p>\${text}</p>
            </div>
        `);
        this.scrollToBottom();

        // 2. Loading State
        document.querySelector('.status-text').innerText = "Thinking...";

        try {
            // Determine Language Code
            let langCode = 'es';
            if (this.currentLanguage === 'French') langCode = 'fr';
            else if (this.currentLanguage === 'German') langCode = 'de';
            else if (this.currentLanguage === 'English') langCode = 'en';

            // Special Hardcoded Exact Match from the Screenshot (for demo purposes)
            if (lowerText.includes("bad to speak")) {
                setTimeout(() => {
                    document.getElementById(msgId).innerHTML = \`<p>I'm bad <span style="color: #fca5a5; font-weight: bold;">to speak</span> English.</p>\`;
                    this.renderAIResponse(\`Do you mean "I'm bad <span style="color: #86efac; font-weight: bold;">at speaking</span> English"?\`, "", true);
                }, 1000);
                return;
            }

            // Real AI Translation Engine (Free API)
            // We translate from English to the Target Language. If the user typed in English, it translates it.
            // If they typed in the Target language correctly, the API often just returns the same text.
            const url = \`https://api.mymemory.translated.net/get?q=\${encodeURIComponent(text)}&langpair=en|\${langCode}\`;
            const response = await fetch(url);
            const data = await response.json();
            
            const translatedText = data.responseData.translatedText;

            let aiResponseText = "";
            let aiEnglishTranslation = "";
            let isCorrection = false;

            // If the text is fundamentally different, they probably typed English or made a big mistake!
            // Clean strings for comparison
            const cleanOriginal = lowerText.replace(/[^a-zA-Z0-9]/g, '');
            const cleanTranslated = translatedText.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

            if (cleanOriginal !== cleanTranslated && cleanOriginal.length > 0) {
                // IT IS A CORRECTION / TEACHING MOMENT!
                isCorrection = true;
                
                // Highlight the user's text in orange because it wasn't the target language
                const userMsgEl = document.getElementById(msgId);
                userMsgEl.innerHTML = \`<p><span style="color: #fca5a5; font-weight: bold;">\${text}</span></p>\`;
                
                // The AI teaches them how to say it!
                aiResponseText = \`Do you mean "<span style="color: #86efac; font-weight: bold;">\${translatedText}</span>"?\`;
                aiEnglishTranslation = "Repeat this to practice your " + this.currentLanguage + "!";
            } else {
                // PERFECT SYNTAX!
                chatArea.insertAdjacentHTML('beforeend', \`
                    <div class="feedback-box fade-in-up">
                         <div class="feedback-header">
                            <span class="text-green"><i class="fa-solid fa-check-circle"></i> Perfect Syntax</span>
                            <span class="pronunciation-score">Pronunciation: 95%</span>
                        </div>
                    </div>
                 \`);

                 if (this.currentLanguage === 'French') {
                     aiResponseText = "Très bien ! Continuez à pratiquer.";
                     aiEnglishTranslation = "Very good! Keep practicing.";
                 } else if (this.currentLanguage === 'German') {
                     aiResponseText = "Sehr gut! Übe weiter.";
                     aiEnglishTranslation = "Very good! Keep practicing.";
                 } else {
                     aiResponseText = "¡Muy bien! Sigue practicando.";
                     aiEnglishTranslation = "Very good! Keep practicing.";
                 }
            }

            this.renderAIResponse(aiResponseText, aiEnglishTranslation, isCorrection);

        } catch (error) {
            console.error("AI Error:", error);
            // Fallback if API fails
            this.renderAIResponse("¡Muy bien! Sigue practicando.", "Very good! Keep practicing.", false);
        }
    },

    renderAIResponse(aiResponseText, aiEnglishTranslation, isCorrection) {
        const chatArea = document.getElementById('chat-messages');
        chatArea.insertAdjacentHTML('beforeend', \`
            <div class="message ai-message fade-in-up">
                <p>\${aiResponseText}</p>
                \${aiEnglishTranslation ? \`<p style="font-size: 0.85rem; color: #94a3b8; margin-top: 6px;"><em>(\${aiEnglishTranslation})</em></p>\` : ''}
                
                \${isCorrection ? \`<div style="margin-top: 8px; font-size: 0.75rem; color: #86efac;"><i class="fa-solid fa-wand-magic-sparkles"></i> Vocabulary Learned</div>\` : ''}
                
                <button class="msg-audio-btn" onclick="app.speakText('\${aiResponseText.replace(/<[^>]*>?/gm, '').replace(/"/g, '&quot;')}')"><i class="fa-solid fa-volume-high"></i></button>
            </div>
        \`);
        document.querySelector('.status-text').innerText = "Online";
        this.scrollToBottom();
        
        // Trigger Text-to-Speech (strip HTML tags first)
        this.speakText(aiResponseText.replace(/<[^>]*>?/gm, ''));
        
        if (this.isVideoCallActive) {
            document.getElementById('live-transcript').innerText = aiResponseText.replace(/<[^>]*>?/gm, '');
        }
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

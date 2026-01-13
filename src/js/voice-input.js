/**
 * Voice Input Module for Farmer-Friendly UI
 * Enables voice-to-text for all input fields
 * Supports multiple Indian languages
 */

class VoiceInputManager {
  constructor() {
    // Check browser support
    this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!this.SpeechRecognition;
    
    if (!this.isSupported) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new this.SpeechRecognition();
    this.currentLanguage = localStorage.getItem('preferredLanguage') || 'hi-IN'; // Default: Hindi
    this.isListening = false;
    
    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 Voice recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🎤 Voice recognition ended');
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error);
      this.isListening = false;
      this.showError(event.error);
    };
  }

  /**
   * Enable voice input for a specific field
   */
  enableForField(inputId, options = {}) {
    const input = document.getElementById(inputId);
    if (!input) {
      console.error(`Input field ${inputId} not found`);
      return;
    }

    const lang = options.language || this.currentLanguage;
    const placeholder = options.placeholder || 'बोलने के लिए माइक पर क्लिक करें';

    // Create voice button
    const voiceBtn = this.createVoiceButton(inputId, lang);
    
    // Insert button after input
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(voiceBtn);
    
    // Add placeholder
    if (!input.placeholder) {
      input.placeholder = placeholder;
    }

    return voiceBtn;
  }

  createVoiceButton(inputId, language) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'voice-input-btn';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
      <span class="voice-hint">🎤 बोलें</span>
    `;
    
    button.onclick = () => this.startListening(inputId, language, button);
    
    return button;
  }

  startListening(inputId, language, button) {
    if (this.isListening) {
      this.recognition.stop();
      return;
    }

    const input = document.getElementById(inputId);
    
    // Set language
    this.recognition.lang = language;
    
    // Visual feedback
    button.classList.add('listening');
    button.innerHTML = `
      <div class="listening-animation"></div>
      <span class="voice-hint">सुन रहे हैं...</span>
    `;

    // Handle results
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      // Update input value
      input.value = transcript;
      
      // Trigger change event
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Show confidence if low
      if (confidence < 0.7) {
        this.showConfirmation(input, transcript);
      }
      
      // Reset button
      button.classList.remove('listening');
      button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        <span class="voice-hint">✓ Done</span>
      `;
      
      // Speak back the result
      this.speakText(`आपने कहा: ${transcript}`, language);
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      button.classList.remove('listening');
    }
  }

  /**
   * Show confirmation dialog for low-confidence results
   */
  showConfirmation(input, transcript) {
    const container = input.parentNode;
    const confirmDiv = document.createElement('div');
    confirmDiv.className = 'voice-confirmation';
    confirmDiv.innerHTML = `
      <p>क्या आपने यह कहा? (Did you say this?)</p>
      <p class="transcript">"${transcript}"</p>
      <button class="btn-yes" onclick="this.parentNode.remove()">✓ हां</button>
      <button class="btn-no" onclick="document.getElementById('${input.id}').value=''; this.parentNode.remove()">✗ नहीं</button>
    `;
    
    container.appendChild(confirmDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (confirmDiv.parentNode) {
        confirmDiv.remove();
      }
    }, 5000);
  }

  /**
   * Text-to-Speech: Speak text aloud
   */
  speakText(text, language = 'hi-IN') {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Show error message
   */
  showError(errorType) {
    const messages = {
      'no-speech': 'कोई आवाज़ नहीं सुनाई दी। कृपया फिर से कोशिश करें।',
      'audio-capture': 'माइक्रोफ़ोन काम नहीं कर रहा है।',
      'not-allowed': 'माइक्रोफ़ोन की अनुमति नहीं दी गई।'
    };

    const message = messages[errorType] || 'कुछ गलत हुआ। कृपया फिर से कोशिश करें।';
    
    // Show toast notification
    this.showToast(message, 'error');
    
    // Speak the error
    this.speakText(message);
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `voice-toast voice-toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Change app language
   */
  setLanguage(langCode) {
    const languageMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN'
    };

    this.currentLanguage = languageMap[langCode] || langCode;
    localStorage.setItem('preferredLanguage', this.currentLanguage);
    
    // Update all voice buttons
    document.querySelectorAll('.voice-input-btn').forEach(btn => {
      btn.dataset.language = this.currentLanguage;
    });

    console.log(`🌍 Language changed to: ${this.currentLanguage}`);
  }

  /**
   * Enable voice for all inputs on page
   */
  enableForAllInputs() {
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
      if (input.id) {
        this.enableForField(input.id);
      }
    });
  }
}

// Initialize global instance
window.VoiceInputManager = new VoiceInputManager();

// Auto-enable on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if voice input should be enabled
  const enableVoice = localStorage.getItem('enableVoiceInput') !== 'false';
  
  if (enableVoice && window.VoiceInputManager.isSupported) {
    console.log('🎤 Voice input enabled');
    // Voice buttons will be added individually per form
  }
});


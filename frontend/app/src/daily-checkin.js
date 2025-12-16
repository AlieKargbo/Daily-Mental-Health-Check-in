
import axios from 'axios'

export function setupDailyCheckin() {
  const form = document.getElementById('checkin-form')
  const textarea = document.getElementById('daily-entry')
  const charCount = document.getElementById('char-count')
  const voiceBtn = document.getElementById('voice-input-btn')
  const voiceStatus = document.getElementById('voice-status')
  const submitBtn = document.getElementById('submit-btn')
  const successMessage = document.getElementById('success-message')

  // Character counter
  textarea.addEventListener('input', () => {
    const count = textarea.value.length
    charCount.textContent = `${count} characters`
    
    // Change color based on length
    if (count > 500) {
      charCount.classList.add('text-green-600')
      charCount.classList.remove('text-gray-500')
    } else {
      charCount.classList.add('text-gray-500')
      charCount.classList.remove('text-green-600')
    }
  })

  // Voice input functionality
  let recognition = null
  let isListening = false

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      isListening = true
      voiceStatus.textContent = 'Listening...'
      voiceBtn.classList.add('text-red-600', 'bg-red-50')
      voiceBtn.classList.remove('text-blue-600', 'hover:bg-blue-50')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        const currentText = textarea.value
        const newText = currentText + (currentText ? ' ' : '') + finalTranscript
        textarea.value = newText
        textarea.dispatchEvent(new Event('input'))
      }
    }

    recognition.onend = () => {
      isListening = false
      voiceStatus.textContent = 'Voice Input'
      voiceBtn.classList.remove('text-red-600', 'bg-red-50')
      voiceBtn.classList.add('text-blue-600', 'hover:bg-blue-50')
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isListening = false
      voiceStatus.textContent = 'Voice Input'
      voiceBtn.classList.remove('text-red-600', 'bg-red-50')
      voiceBtn.classList.add('text-blue-600', 'hover:bg-blue-50')
    }

    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop()
      } else {
        recognition.start()
      }
    })
  } else {
    // Hide voice button if not supported
    voiceBtn.style.display = 'none'
  }

  // Form submission with axios and enhanced validation
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const text = textarea.value.trim()
    
    // Enhanced validation - minimum 20 characters
    if (text.length < 20) {
      showError("Please write at least 20 characters for a meaningful analysis.")
      return
    }

    // Disable submit button during processing
    submitBtn.disabled = true
    submitBtn.textContent = 'Analyzing...'
    hideError()

    try {
      // The request goes to /api/checkin, which the Vite proxy forwards to http://localhost:8000/checkin
      const response = await axios.post('/api/checkin', {
        user_text: text,
      })

      console.log('Check-in submitted successfully:', response.data)
      
      // Store entry locally as backup and for offline access
      const entries = JSON.parse(localStorage.getItem('dailyEntries') || '[]')
      entries.push({
        id: response.data.id,
        entry: text,
        timestamp: response.data.timestamp,
        sentiment_score: response.data.sentiment_score,
        anomaly_flag: response.data.anomaly_flag,
        date: new Date().toLocaleDateString()
      })
      localStorage.setItem('dailyEntries', JSON.stringify(entries))

      // Update success message with sentiment info
      const successText = successMessage.querySelector('p')
      let message = 'Thank you for sharing! Your entry has been recorded.'
      
      if (response.data.sentiment_score !== undefined) {
        const sentimentLabel = response.data.sentiment_score > 0.6 ? 'positive' : 
                              response.data.sentiment_score < 0.4 ? 'concerning' : 'neutral'
        message += ` Sentiment detected: ${sentimentLabel}.`
      }
      
      if (response.data.anomaly_flag) {
        message += ' We noticed this entry might indicate you need extra support.'
      }
      
      successText.textContent = message

      // Clear the form and show success
      textarea.value = ''
      charCount.textContent = '0 characters'
      successMessage.classList.remove('hidden')
      
      // Clear draft after successful submission
      localStorage.removeItem('dailyEntryDraft')
      
      // Hide success message after 8 seconds
      setTimeout(() => {
        successMessage.classList.add('hidden')
      }, 8000)

      // Trigger refresh of chart data if callback exists
      if (window.onCheckinSuccess) {
        window.onCheckinSuccess()
      }

    } catch (err) {
      showError("Failed to submit entry. Check the Python server and proxy setup.")
      console.error(err)
      
      // Fallback to local storage if backend is unavailable
      const entries = JSON.parse(localStorage.getItem('dailyEntries') || '[]')
      entries.push({
        id: Date.now(),
        entry: text,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        offline: true
      })
      localStorage.setItem('dailyEntries', JSON.stringify(entries))
      
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false
      submitBtn.textContent = 'Submit Entry'
    }
  }

  // Helper functions for error handling
  function showError(message) {
    let errorDiv = document.getElementById('error-message')
    if (!errorDiv) {
      errorDiv = document.createElement('div')
      errorDiv.id = 'error-message'
      errorDiv.className = 'mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'
      errorDiv.innerHTML = `
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <p class="text-red-800 font-medium"></p>
        </div>
      `
      form.appendChild(errorDiv)
    }
    errorDiv.querySelector('p').textContent = message
    errorDiv.classList.remove('hidden')
  }

  function hideError() {
    const errorDiv = document.getElementById('error-message')
    if (errorDiv) {
      errorDiv.classList.add('hidden')
    }
  }

  // Attach the submit handler
  form.addEventListener('submit', handleSubmit)

  // Auto-save draft functionality
  let saveTimeout
  textarea.addEventListener('input', () => {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      localStorage.setItem('dailyEntryDraft', textarea.value)
    }, 1000)
  })

  // Load draft on page load
  const draft = localStorage.getItem('dailyEntryDraft')
  if (draft) {
    textarea.value = draft
    textarea.dispatchEvent(new Event('input'))
  }

  // Clear draft after successful submission
  form.addEventListener('submit', () => {
    localStorage.removeItem('dailyEntryDraft')
  })

  // Load previous entries on page load
  loadPreviousEntries()
}

// Function to load and display previous entries using axios
async function loadPreviousEntries() {
  try {
    const response = await axios.get('/api/timeline')
    console.log('Loaded entries from backend:', response.data)
    
    // Update local storage with backend data
    const localEntries = response.data.map(entry => ({
      id: entry.id,
      entry: entry.user_text,
      timestamp: entry.timestamp,
      sentiment_score: entry.sentiment_score,
      anomaly_flag: entry.anomaly_flag,
      date: new Date(entry.timestamp).toLocaleDateString()
    }))
    localStorage.setItem('dailyEntries', JSON.stringify(localEntries))
    
  } catch (error) {
    console.log('Could not load entries from backend, using local storage:', error.message)
  }
}

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

  function getLocalEntriesKey(anonUserId) {
    return anonUserId ? `dailyEntries_${anonUserId}` : 'dailyEntries'
  }

  async function getAnonUserId() {
    let anonUserId = localStorage.getItem('anonUserId')
    if (anonUserId) {
      return anonUserId
    }

    try {
      const response = await axios.get('/api/auth/anon', {
        headers: { 'Accept': 'application/json' },
        timeout: 15000,
      })
      anonUserId = response.data?.anon_user_id
      if (anonUserId) {
        localStorage.setItem('anonUserId', anonUserId)
        return anonUserId
      }
    } catch (err) {
      console.warn('Unable to fetch anonymous ID, falling back to local generation.', err)
    }

    anonUserId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem('anonUserId', anonUserId)
    return anonUserId
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
      const anonUserId = await getAnonUserId()
      const response = await axios.post('/api/checkin', {
        user_text: text,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Anon-User-Id': anonUserId,
        }
      })

      console.log('Check-in submitted successfully:', response.data)
      
      const entriesKey = getLocalEntriesKey(anonUserId)
      const entries = JSON.parse(localStorage.getItem(entriesKey) || '[]')
      entries.push({
        id: response.data.id,
        entry: text,
        timestamp: response.data.timestamp,
        sentiment_score: response.data.sentiment_score,
        anomaly_flag: response.data.anomaly_flag,
        anon_user_id: response.data.anon_user_id || anonUserId,
        date: new Date().toLocaleDateString()
      })
      localStorage.setItem(entriesKey, JSON.stringify(entries))

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

      textarea.value = ''
      charCount.textContent = '0 characters'
      successMessage.classList.remove('hidden')
      
      localStorage.removeItem('dailyEntryDraft')
      
      setTimeout(() => {
        successMessage.classList.add('hidden')
      }, 8000)

      if (window.onCheckinSuccess) {
        window.onCheckinSuccess()
      }

    } catch (err) {
      showError("Failed to submit entry. Check the Python server and proxy setup.")
      console.error(err)
      
      const anonUserId = localStorage.getItem('anonUserId') || `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      if (!localStorage.getItem('anonUserId')) {
        localStorage.setItem('anonUserId', anonUserId)
      }
      const entriesKey = getLocalEntriesKey(anonUserId)
      const entries = JSON.parse(localStorage.getItem(entriesKey) || '[]')
      entries.push({
        id: Date.now(),
        entry: text,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        offline: true,
        anon_user_id: anonUserId
      })
      localStorage.setItem(entriesKey, JSON.stringify(entries))
      
    } finally {
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

// Function to load and display previous entries from localStorage
async function loadPreviousEntries() {
  const anonUserId = localStorage.getItem('anonUserId')
  const key = anonUserId ? `dailyEntries_${anonUserId}` : 'dailyEntries'
  const entries = JSON.parse(localStorage.getItem(key) || '[]')
  if (entries.length > 0) {
    console.log('Loaded local entries:', entries.length)
  } else {
    console.log('No local entries found for key:', key)
  }
}
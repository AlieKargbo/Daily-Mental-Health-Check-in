import './style.css'
import { setupDailyCheckin } from './daily-checkin.js'

document.querySelector('#app').innerHTML = `
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Daily Mental Health Check-in</h1>
        <p class="text-gray-600">Take a moment to reflect on your day and share your thoughts</p>
      </header>
      
      <div class="bg-white rounded-xl shadow-lg p-8">
        <form id="checkin-form" class="space-y-6">
          <div>
            <label for="daily-entry" class="block text-lg font-medium text-gray-700 mb-3">
              How are you feeling today? Share whatever is on your mind.
            </label>
            <textarea 
              id="daily-entry" 
              name="daily-entry"
              rows="8"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400"
              placeholder="Write about your day, your feelings, thoughts, or anything you'd like to share..."
              required
            ></textarea>
            <div class="flex justify-between items-center mt-2">
              <span id="char-count" class="text-sm text-gray-500">0 characters</span>
              <button 
                type="button" 
                id="voice-input-btn"
                class="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                title="Use voice input"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd"></path>
                </svg>
                <span id="voice-status">Voice Input</span>
              </button>
            </div>
          </div>
          
          <div class="flex justify-center">
            <button
              onClick="handleSubmit()"
              type="submit" 
              id="submit-btn"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Entry
            </button>
          </div>
        </form>
        
        <div id="success-message" class="hidden mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <p class="text-green-800 font-medium">Thank you for sharing! Your entry has been recorded.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`

setupDailyCheckin()

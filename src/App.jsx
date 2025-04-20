import { useState, useEffect, useRef } from 'react'
import './App.css'
import axios from 'axios';
import Footer from './Footer';

function App() {
  const [emailContent, setEmailContent] = useState('')
  const [tone, setTone] = useState('')
  const [generatedReply, setGeneratedReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Reference for the background container
  const backgroundRef = useRef(null)

  // Load Vanta scripts and initialize
  useEffect(() => {
    // Create script elements for THREE.js and Vanta
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initVanta = async () => {
      try {
        // Load THREE.js first
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        // Then load Vanta birds
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js');
        
        // Initialize if Vanta is loaded and element exists
        if (window.VANTA && backgroundRef.current) {
          window.VANTA.BIRDS({
            el: backgroundRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color1: 0xbda7a7,
            birdSize: 1.10,
            wingSpan: 24.00,
            quantity: 3.00
          });
        }
      } catch (error) {
        console.error("Failed to load Vanta animation:", error);
      }
    };

    initVanta();

    // No cleanup needed for this CDN approach
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('')
    try {
      const response = await axios.post("https://email-ai-reply-generator.onrender.com/api/email/generate",
        { emailContent, tone }
      );
      setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
      setLoading(false);
    } catch (error) {
      setError('Failed to generate email reply. Please try again')
      console.error(error)
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Background div with ref */}
      <div ref={backgroundRef} className="fixed inset-0 -z-10"></div>
      
      {/* Content */}
      <div className="w-full max-w-4xl backdrop-blur-md rounded-xl shadow-2xl overflow-hidden animate-fadeIn transition-all duration-300 transform hover:scale-[1.01] z-10">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center relative animate-slideDown">
            <span className="bg-amber-200 bg-clip-text text-transparent">
              Email Reply Generator
            </span>
          </h1>

          <div className="space-y-6 animate-slideUp">
            <div className="relative group">
              <textarea
                className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-transparent outline-none transition duration-200 bg-white/90 resize-none"
                placeholder="Enter your email"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              ></textarea>
              <div className="absolute bottom-0 left-0 h-0.5 transition-all duration-300 w-0 group-focus-within:w-full"></div>
            </div>

            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-transparent outline-none transition duration-200 bg-white/90 appearance-none cursor-pointer"
              >
                <option value="">Select Tone (Optional)</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!emailContent || loading}
              className={`w-full py-3 rounded-lg font-semibold transition duration-300 transform hover:scale-[1.02] ${!emailContent || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : 'Generate Reply'}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-lg animate-pulse">
              {error}
            </div>
          )}

          {generatedReply && (
            <div className="mt-8 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <span className="bg-gradient-to-r from-amber-300 to-pink-600 bg-clip-text text-transparent">Generated Reply</span>
                <div className="ml-2 flex-grow h-px bg-gradient-to-r from-green-600/30 to-blue-600/30"></div>
              </h2>
              <div className="relative group">
                <textarea
                  className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 bg-white/90 resize-none"
                  value={generatedReply}
                  readOnly
                ></textarea>
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 w-0 group-focus-within:w-full"></div>
              </div>
              <button
                onClick={handleCopy}
                className="mt-4 px-6 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50 transition duration-300 flex items-center justify-center font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
        <div className='text-white text-2xl mt-28 text-center '>  <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center relative animate-slideDown">
            <span className="bg-amber-200 bg-clip-text text-transparent">
              About Dev
            </span>
          </h1></div>
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 z-10 ">
        <Footer />
    </div>
      </div>
      </div>
  )
}

export default App

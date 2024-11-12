// 'use client';

// import { useState } from 'react';
// import { MessageCircle } from 'lucide-react';

// export default function FeedbackForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     const formElement = e.currentTarget;
//     const formData = new FormData(formElement);
    
//     // Convert FormData to URLSearchParams with proper typing
//     const searchParams = new URLSearchParams();
//     formData.forEach((value, key) => {
//       searchParams.append(key, value.toString());
//     });

//     try {
//       const response = await fetch('/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//         body: searchParams.toString()
//       });

//       if (response.ok) {
//         setStatus('success');
//         formElement.reset();
//         setTimeout(() => setStatus('idle'), 3000);
//       } else {
//         setStatus('error');
//         console.error('Form submission failed:', response.status);
//       }
//     } catch (error) {
//       setStatus('error');
//       console.error('Form submission error:', error instanceof Error ? error.message : 'Unknown error');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed bottom-4 left-0 right-0 mx-auto max-w-md px-4">
//       <form
//         className="bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-2"
//         name="feedback"
//         method="POST"
//         data-netlify="true"
//         onSubmit={handleSubmit}
//       >
//         <input type="hidden" name="form-name" value="feedback" />
        
//         {/* Honeypot field */}
//         <p className="hidden">
//           <label>
//             Don&apos;t fill this out if you&apos;re human: 
//             <input name="bot-field" />
//           </label>
//         </p>

//         <MessageCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
//         <input
//           type="text"
//           name="message"
//           placeholder="Have feedback? Let us know!"
//           className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-200 placeholder-gray-400"
//           disabled={isSubmitting}
//         />
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-indigo-500 text-white rounded-md px-3 py-1 text-sm font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isSubmitting ? 'Sending...' : 'Send'}
//         </button>
//       </form>

//       {/* Status Messages */}
//       {status === 'success' && (
//         <div className="absolute -top-12 left-0 right-0 mx-auto text-sm text-green-400 bg-green-900 bg-opacity-50 p-2 rounded-md text-center">
//           Thanks for your feedback!
//         </div>
//       )}

//       {status === 'error' && (
//         <div className="absolute -top-12 left-0 right-0 mx-auto text-sm text-red-400 bg-red-900 bg-opacity-50 p-2 rounded-md text-center">
//           Failed to send feedback. Please try again.
//         </div>
//       )}
//     </div>
//   );
// }
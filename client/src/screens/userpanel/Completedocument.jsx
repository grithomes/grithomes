import React from 'react';
import completedgif from './completed.gif'
import './Completedocument.css'; 

export default function Completedocument() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
                <div className="w-32 h-32 relative">
                    {/* Using the gif, but putting it in a nice rounded container */}
                    <img src={completedgif} alt="Success" className="w-full h-full object-contain" />
                </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">You're All Set!</h1>
            
            <div className="bg-green-50 text-green-800 rounded-xl p-4 mb-8 text-sm md:text-base border border-green-100">
                <p className="font-medium">Document has been signed successfully.</p>
                <p className="mt-1">You will receive a confirmation email with a link to your signed document shortly.</p>
            </div>
            
            <div className="border-t border-gray-100 pt-8 mt-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Save and view your document</h2>
                <p className="text-gray-500 mb-6">Sign up for an <strong className="text-gray-900">InvoicePro account</strong> to access and create your own documents.</p>
                {/* <button className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">Save document for free</button> */}
            </div>
        </div>
    </div>
  );
}

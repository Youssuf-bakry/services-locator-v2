import React from 'react'

export default function AdminHeader() {
  return (
            <header className="bg-red-600 text-white p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">🔧 Admin Mode</h1>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition-colors"
                    >
                        ← Back to Main App
                    </button>
                </div>
            <p className="text-gray-600 text-md bg-white shadow-sm border-b border-gray-100 text-center ">Add new service locations to the database</p>

            </header>
        
   
  )
}

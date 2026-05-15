import React, { useEffect } from 'react'
import Sidebar from './Sidebar';
import Dashboard from './Dashboard'


export default function Userdashboard() {
    return (
        <div className='bg'>
            <div className='w-full '>
                <div className="flex flex-col md:flex-row">
                    <Sidebar />
                    <div className="flex-1 w-full mx-auto px-4">

                        <Dashboard />
                    </div>
                </div>
            </div>
        </div>
    )
}

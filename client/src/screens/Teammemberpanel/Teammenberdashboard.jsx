import React, { useEffect } from 'react'
import Teamnavbar from './Teamnavbar'
import Dashboard from './Dashboard'
import Teamnav from './Teamnav'

export default function Teammenberdashboard() {
    return (
        <div className='bg'>
            <div className='w-full '>
                <div className="flex flex-col md:flex-row">
                    <div className='col-lg-2 col-md-3 vh-100 b-shadow bg-white d-lg-block d-md-block d-none'>
                        <Teamnavbar />
                    </div>
                    <div className="flex-1 w-full mx-auto px-4">
                        <div className='block md:hidden mt-2'>
                            <Teamnav />
                        </div>
                        <Dashboard />
                    </div>
                </div>
            </div>
        </div>
    )
}

import React from 'react'
import UsersList from '../components/UsersList'
import { ShowImage } from '../pages'

const MainLayout = () => {
    return (
        <>
            <div className='flex items-center justify-center h-screen bg-neutral-50'>
                <div className='w-[80%] min-h-[90%] mx-auto bg-white rounded-2xl shadow'>
                    <div className='w-full flex h-full'>
                        <div className='w-[25%] border-r-2 border-r-stone-100'>
                            <UsersList></UsersList>
                        </div>
                        <div className='w-[75%]'>
                            <ShowImage></ShowImage>
                        </div>
                    </div>
                </div>
                <div className=''>
                </div>
            </div>

        </>
    )
}

export default MainLayout
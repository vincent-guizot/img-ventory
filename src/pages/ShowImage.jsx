import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import ImageCard from '../components/ImageCard'

const Item = () => {
    const { username } = useParams()

    const { images, loading, error } = useSelector(state => state.images)

    return (
        <div className='w-full'>
            <div className='w-full p-3'>

                <p>Img - ventory</p>
            </div>
            <div className='w-full p-3 grid grid-cols-5 gap-3'>
                {images?.map(image => {
                    return (
                        <ImageCard image={image}></ImageCard>
                    )
                })}
            </div>
        </div>
    )
}

export default Item
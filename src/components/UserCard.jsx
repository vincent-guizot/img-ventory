import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const UserCard = ({ user }) => {
    const location = useLocation()
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        setIsActive(false)
        if ("/" + user.username === location.pathname) {
            setIsActive(true);
        }
    }, [location.pathname, user.username])

    return (
        <Link to={`/${user.username}`}>
            {console.log(isActive)}
            <div className={`flex items-center p-2 rounded-lg mb-2 max-w-sm hover:bg-stone-100
            ${isActive ? "bg-stone-100" : ""}`
            }>
                <img className="w-15 h-15 rounded-full object-cover" src={user.avatar} alt="User Avatar" />
                <div className="ml-5">
                    <h2 className="font-semibold text-stone-900">{user.username}</h2>
                    <p className="text-sm text-stone-500">{user.email}</p>
                </div>
            </div>
        </Link>
    )
}

export default UserCard
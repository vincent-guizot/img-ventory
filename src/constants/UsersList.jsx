import React from "react";
import { useSelector } from "react-redux";
import UserCard from '../components/UserCard'

const UsersList = () => {
  const { users, loading, error } = useSelector(state => state.users)

  return <div>
    <div className="w-full p-3">
      <p>Users online</p>
    </div>
    <hr />
    {loading && <h3>Loading</h3>}
    {error && <p>{error}</p>}
    <div className="w-full p-3 grid grid-cols-1">
      {users?.map(user => {
        return <UserCard user={user}></UserCard>
      })}
    </div>

  </div>;
};

export default UsersList;

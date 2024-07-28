import { useEffect, useState } from 'react';
import UserContext from './userContext';
import axios from 'axios';

const UserState = (props) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.get('/profile', { headers: { 'token': token } })
        .then(({ data }) => {
          setUser(data);
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
          setUser(null);
        });
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, setUser, setToken }}>
      {props.children}
    </UserContext.Provider>
  );
}

export default UserState;

import React, { useState, useContext } from 'react';
import user_icon from './Assets/person.png';
import passw_icon from './Assets/password.png';
import email_icon from './Assets/email.png';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import userContext from '../context/userContext';

function Login() {
  const [action, changeAction] = useState("Login");
  const navigate = useNavigate();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const { setToken } = useContext(userContext);

  const handleSubm = async (e) => {
    e.preventDefault();
    if (action === 'Login') {
      try {
        const res = (await axios.post("/login", data)).data;
        if (res.error) {
          toast.error(res.error);
        } else {
          localStorage.setItem('token', res.user);
          setToken(res.user); 
          setData({ name: "", password: "", email: "" });
          toast.success("Login Successful, Welcome!");
          navigate('/');
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const res = (await axios.post("/register", data)).data;
        if (res.error) {
          toast.error(res.error);
        } else {
          localStorage.setItem('token', res.user);
          setToken(res.user);
          setData({ name: "", password: "", email: "" });
          toast.success("Registration Successful, Welcome!");
          navigate('/');
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className='login'>
    <form className='container' onSubmit={handleSubm}>
      <div className='SubmitContainer'>
        <div className={action === "Login" ? 'submit gray' : 'submit '} onClick={() => changeAction("Sign Up")}>Sign Up</div>
        <div className={action === "Login" ? 'submit ' : 'submit gray'} onClick={() => changeAction("Login")}>Login</div>
      </div>
      <div className='header'>
        <div className='text'>{action}</div>
        <div className='underline'></div>
      </div>
      <div className='inputs'>
        {action === 'Login' ? "" : <div className='input'>
          <img src={user_icon} alt=""></img>
          <input type='text' placeholder='Name' value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
        </div>}
        <div className='input'>
          <img src={email_icon} alt=""></img>
          <input type='email' placeholder='Email-ID' value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
        </div>
        <div className='input'>
          <img src={passw_icon} alt=""></img>
          <input type='password' placeholder='Password' value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
        </div>
      </div>
      <div className='SubmitContainer'>
        <button className='submit gray' type='submit' >{action}</button>
        
      </div>
    </form></div>
  );
}

export default Login;

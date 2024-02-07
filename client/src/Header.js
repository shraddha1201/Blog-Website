import { useContext, useEffect, useState } from 'react';
import {Link} from 'react-router-dom';
import { UserContext } from './UserContext';

export default function Header(){
  const {setUserInfo,userInfo}= useContext(UserContext);  // const [username,setUsernme]= useState(null); 
  useEffect(()=>{ //checking if we are logged in--> how:we have token inside our cookies but anyone can have cookies so we need check this token if it's valid need to create endpoint for this( this is our endpoint useEffect)
    fetch('http://localhost:4000/profile',{
      credentials: 'include',
    }).then(response=>{
       response.json().then(userInfo=>{// setUsernme(userInfo.username);
          setUserInfo(userInfo);// setting above fetched username name
       });
    });
  },[]);

  function logout(){ //we have reset cookie
      fetch('http://localhost:4000/logout',{
        credentials: 'include',
        method: 'POST',
      });
      setUserInfo(null);
  }

   const username=userInfo?.username;
    return (
    <header>
    <Link to="/" className="logo">MyBlog</Link>
    <nav>
      {username && (
        <>
          <Link to="/create">Create new post</Link>
          <a onClick={logout}>Logout ({username})</a>
        </>
      )}

      {!username && (
        <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  </header> );
}
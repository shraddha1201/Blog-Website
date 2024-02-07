import { useState, useContext } from "react";
import {Navigate} from "react-router-dom";
import {UserContext} from "../UserContext";

export default function Login(){
    const[username,setUsername]= useState('');
    const[password,setPassword]= useState('');
    const[redirect,setRedirect]= useState(false); 
    const {setUserInfo}=useContext(UserContext);
    async function login(ev)
    { 
        ev.preventDefault();
        const response=await fetch('http://localhost:4000/login', {
            method: 'POST',
            body: JSON.stringify({username,password}),
            headers: {'Content-Type':'application/json'},
            credentials: 'include',// our cookies will be considered as a credential & it will be included to our browser
        });

        if(response.ok){    // if login successful -> needs to redirecting user to home page
           response.json().then(userInfo=>{
                setUserInfo(userInfo);
                setRedirect(true);
           })
        }else{
            alert('wrong credentials');
        }
    }


    if(redirect){
        return <Navigate to={'/'} />
    }
    return<>
        <form className="login" onSubmit={login}>
            <h1>Login</h1>
            <input type="text" placeholder="username" value={username} onChange={event=>setUsername(event.target.value)}/>
            <input type="password" placeholder="password" value={password} onChange={event=>setPassword(event.target.value)}/>
            <button>Login</button>
        </form>
    </>
}
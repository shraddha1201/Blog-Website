import { createContext, useState } from 'react';

export const UserContext= createContext({});//Context: an alternative to passing props

export function UserContextProvider({children}){
    const [userInfo, setUserInfo]=useState({});
    return (
        <UserContext.Provider value={{userInfo,setUserInfo}}>
            {children}
        </UserContext.Provider>
    )// it will return all the children
}
//not getting this???????
import { useEffect, useState } from "react";
import Post from "../Post"

//in homepage we want all our posts
export default function IndexPage() {
    const [posts,setPosts]=useState([]);
    useEffect(()=>{
        fetch('http://localhost:4000/post').then(response=>{
            response.json().then(posts=>{// posts variable this response json will have all the posts for our homepage
                setPosts(posts);
            });
        });
    },[]);
    return <>
    {posts.length>0 && posts.map(post=>(//if there is any posts
        <Post {...post}/>
    ))}
    </>;
}
import {useCallback, useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [length,setlength]=useState(8);
  const [numberallowed,setnumberallowed]=useState(false);
  const [charallowed,setcharallowed]=useState(false);
  const [password,setpassword]=useState("");
  const passwordgenerator=useCallback(()=>{
    let pass=""
    let str="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    if(numberallowed)str+="0123456789"
    if(charallowed)str+="!@#$%^&*()"
    for(let i=1;i<length;i++){
      let char=Math.floor(Math.random()*str.length+1)
    pass+=str.charAt(char)}
    setpassword(pass)
  },[length,numberallowed,charallowed,setpassword])
  

useEffect(()=>{passwordgenerator()},[length,numberallowed,charallowed,passwordgenerator])
const ref=useRef(null)
const copypasswordclipboard=useCallback(()=>{
  ref.current?.select();
  ref.current?.setSelectionRange(0,8);
  window.navigator.clipboard.writeText(password)
 


},[password])


  

  return (
    <>
      <div className='w-full max-w-md mx-auto shadow-md rounded-lg px-4 my-8 text-orange-500   bg-black'>
          <h1 className='text-white text-center'>password generator</h1>
           <div className='flex shadow rounded-lg overflow-hidden mb-4'>
            <input type="text"
            value={password}
            className='outline none w-full py-1 px-3 h'
            placeholder='password'
            readOnly
            ref={ref} />
            <button onClick={copypasswordclipboard} className='outline-none bg-grey text-white '>copy</button>
           </div>
           <div className='flex text-sm gap-x-2'>
            <div className='flex items-center gap-x'>
              <input type="range"
                     min={6}
                     max={50}
                     value={length}
                     className='cursor-pointer' 
                     onChange={(e)=>{setlength(e.target.value)}}/>
                     <label>length:{length}</label>
            </div>
            <div className='flex items-center gap-x-1 text-white'>
              <input type="checkbox"
                     defaultChecked={numberallowed}
                     id='numberInput'
                     onChange={()=>{setnumberallowed((prev)=>!prev)}} />
              <label htmlFor='numberInput'>Numbers</label>       
            </div>
            <div className='flex items-center gap-x-1'>
              <input type="checkbox"
                     defaultChecked={charallowed}
                     id='charInput'
                     onChange={()=>{setcharallowed((prev)=>!prev)}} />
              <label htmlFor="charInput">character</label>  
           </div>

         </div>  
       </div>
    
    </>
  )
}

export default App

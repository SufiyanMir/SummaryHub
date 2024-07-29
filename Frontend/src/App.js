import Home from './Pages/Home'
import Login from './Pages/Login'
import UserState from './context/userState'
import axios from 'axios';
import {Toaster} from 'react-hot-toast';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
axios.defaults.baseURL="https://summaryhub-backend.onrender.com"
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><Home /></>
    },
    {
      path: "/login",
      element: <><Login /></>
    },
    
    
  ])
  return (
    <><UserState>
      <Toaster position='bottom-right' toastOptions={{duration:2000}}/>
      <RouterProvider router={router} />
    </UserState>
    </>
  )
}

export default App

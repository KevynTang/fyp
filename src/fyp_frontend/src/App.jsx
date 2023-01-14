import './index.css'

import store from './store/store'
import { Provider } from 'react-redux'
import { useSelector, useDispatch } from 'react-redux'
import { 
  createAuthClient, 
  isAuthClientReady, 
  checkAuthentication, 
  isAuthenticated, 
  createActor, 
  isActorReady, 
  getAccountInfo 
} from './store/auth'

import { RouterProvider } from "react-router-dom"
import { createBrowserRouter } from "react-router-dom"

import React, { useEffect } from "react"
import { createRoot } from "react-dom/client"

import Header from "./components/Header"
import Footer from "./components/Footer"
import LoginView from "./views/LoginView"
import Home from "./views/Home"
import Profile from './views/Profile'
import Loading from './components/Loading'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginView />,
  },
  {
    path: "/profile",
    element: <Profile />,
  }
]);

const App = () => {

  const dispatch = useDispatch()
  const authClientReady = useSelector(isAuthClientReady)
  const actorReady = useSelector(isActorReady)
  const authenticated = useSelector(isAuthenticated)

  useEffect(() => {
    dispatch(createAuthClient())
  }, [])

  useEffect(() => {
    dispatch(checkAuthentication())
  }, [authClientReady])

  useEffect(() => {
    if (authenticated) {
      dispatch(createActor())
    }
  }, [authenticated])

  useEffect(() => {
    if (actorReady) {
      dispatch(getAccountInfo())
    }
  }, [actorReady])

  return (
    <div className="">
      <Loading />
      <Header />
      <div className="min-h-screen bg-stone-50">
        <div className="w-full h-16"></div>
        <React.StrictMode>
          <RouterProvider router={ router } />
        </React.StrictMode>
      </div>
      <hr />
      <Footer />
    </div>
  )
}

const root = createRoot(document.getElementById("app"))
root.render(
  <Provider store={ store }>
    <App />
  </Provider>
)
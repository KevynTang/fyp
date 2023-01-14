import { canisterId as backendCanisterId, createActor as backendCreateActor } from "../../../declarations/fyp_backend";
import { AuthClient } from "@dfinity/auth-client"

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'


// internet identity canister link
let identityProvider = "https://identity.ic0.app/"
if (process.env.NODE_ENV == "development") {
  identityProvider = "http://127.0.0.1:4943/?canisterId=r7inp-6aaaa-aaaaa-aaabq-cai"
}


// non-serializable variables outside the global state
/* 
  authentication services provider
*/
let authClient = null
export const getAuthClient = () => {
  return authClient
}

/* 
  backend connector
*/
let actor = null
export const getActor = () => {
  return actor
}


// authentication-related async thunks
/* 
  initialize auth client
*/
export const createAuthClient = createAsyncThunk('auth/createAuthClient', async (dispatch) => {
  authClient = await AuthClient.create()
  return true
})

/* 
  initialize backend connector
*/
export const createActor = createAsyncThunk('auth/createActor', async () => {
  actor = await backendCreateActor(backendCanisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  })
  return true
})

/* 
  authentication status checker
*/
export const checkAuthentication = createAsyncThunk('auth/checkAuthentication', async () => {
  return await authClient.isAuthenticated()
})

/* 
  login function
*/
export const login = createAsyncThunk('auth/login', async () => {
  await authClient.login({
    identityProvider,
    onSuccess: () => {
      return true
    },
  });
})

/* 
  logout function
*/
export const logout = createAsyncThunk('auth/logout', async() => {
  await authClient.logout()
  actor = null
  return true
})

/*
  Get Account Info
*/
export const getAccountInfo = createAsyncThunk('auth/getAccountInfo', async() => {
  const account = await actor.test_get_account()
  account.identity = account.identity.toString()
  return account
})

const emptyAccount = {
  identity: "iiii-iiii-iiii-iiii",
  nickname: "Unknown",
  signature: "no signature was left",
  level: 0,
  registration_time: "00-00-00"
}

// auth global state
export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthClientReady: false,
    isActorReady: false,
    isAuthenticated: false,
    currentAccount: {
      ...emptyAccount
    }
  },
  reducers: {

  },
  extraReducers(builder) {
    builder.addCase(createAuthClient.fulfilled, (state) => {
      state.isAuthClientReady = true
    }).addCase(createActor.fulfilled, (state) => {
      state.isActorReady = true
    }).addCase(checkAuthentication.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload
    }).addCase(login.fulfilled, (state) => {
      state.isAuthenticated = true
    }).addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false
      state.isActorReady = false
    }).addCase(getAccountInfo.fulfilled, (state, action) => {
      state.currentAccount = action.payload
    })
  }
})

export default authSlice.reducer


// selectors
export const isAuthClientReady = state => state.auth.isAuthClientReady
export const isActorReady = state => state.auth.isActorReady
export const isAuthenticated = state => state.auth.isAuthenticated
export const currentAccount = state => state.auth.currentAccount


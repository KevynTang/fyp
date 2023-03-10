import { canisterId as backendCanisterId, createActor as backendCreateActor } from "../../../declarations/fyp_backend";
import { AuthClient } from "@dfinity/auth-client"

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { startLoading, stopLoading } from "./control";


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
export const createAuthClient = createAsyncThunk('auth/createAuthClient', async (_, { dispatch }) => {
  dispatch(startLoading())
  authClient = await AuthClient.create()
  dispatch(stopLoading())
  return true
})

/* 
  initialize backend connector
*/
export const createActor = createAsyncThunk('auth/createActor', async (_, { dispatch }) => {
  dispatch(startLoading())
  actor = await backendCreateActor(backendCanisterId, {
    agentOptions: {
      identity: authClient.getIdentity(),
    },
  })
  dispatch(stopLoading())
  return true
})

/* 
  authentication status checker
*/
export const checkIfAuthenticated = createAsyncThunk('auth/checkIfAuthenticated', async (_, { dispatch }) => {
  dispatch(startLoading())
  const isAuthenticated = await authClient.isAuthenticated()
  dispatch(stopLoading())
  return isAuthenticated
})

/* 
  login function
*/
export const login = createAsyncThunk('auth/login', async (_, { dispatch }) => {
  dispatch(startLoading())
  await authClient.login({
    identityProvider,
    onSuccess: () => {},
  })
  dispatch(stopLoading())
})

/* 
  logout function
*/
export const logout = createAsyncThunk('auth/logout', async(_, { dispatch }) => {
  dispatch(startLoading())
  await authClient.logout()
  actor = null
  dispatch(stopLoading())
  return true
})

/*
  account status checker
*/
export const checkIfAccountExists = createAsyncThunk('auth/checkIfAccountExists', async(_, { dispatch }) => {
  dispatch(startLoading())
  const isAccountExists = await actor.is_account_exists()
  dispatch(stopLoading())
  return isAccountExists
})

/*
  get account info
*/
export const getAccountInfo = createAsyncThunk('auth/getAccountInfo', async(_, { dispatch }) => {
  dispatch(startLoading())
  const account = await actor.get_account_info()
  account.identity = account.identity.toString()
  dispatch(stopLoading())
  return account
})

/*
  update account info
*/
export const updateAccountInfo = createAsyncThunk('auth/updateAccountInfo', async(accountInfo, { dispatch }) => {
  dispatch(startLoading())
  const account = await actor.update_account_info(accountInfo)
  account.identity = account.identity.toString()
  dispatch(stopLoading())
  return account
})

const emptyAccount = {
  identity: "-----",
  nickname: "-----",
  signature: "-----",
  level: 0,
  registration_time: "-----"
}

// auth global state
export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthClientReady: false,
    isActorReady: false,
    isAuthenticated: false,
    isAccountExists: false,
    currentAccount: {
      ...emptyAccount
    }
  },
  reducers: {

  },
  // TODO: maybe remake this with normal reducers
  extraReducers(builder) {
    builder.addCase(createAuthClient.fulfilled, (state) => {
      state.isAuthClientReady = true
    }).addCase(createActor.fulfilled, (state) => {
      state.isActorReady = true
    }).addCase(checkIfAuthenticated.fulfilled, (state, action) => {
      state.isAuthenticated = action.payload
    }).addCase(login.fulfilled, (state) => {
      state.isAuthenticated = true
    }).addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false
      state.isActorReady = false
    }).addCase(checkIfAccountExists.fulfilled, (state, action) => {
      state.isAccountExists = action.payload
    }).addCase(getAccountInfo, (state, action) => {
      state.currentAccount = action.payload
    }).addCase(updateAccountInfo.fulfilled, (state, action) => {
      state.currentAccount = action.payload
    })
  }
})

export default authSlice.reducer


// selectors
export const isAuthClientReady = state => state.auth.isAuthClientReady
export const isActorReady = state => state.auth.isActorReady
export const isAuthenticated = state => state.auth.isAuthenticated
export const isAccountExists = state => state.auth.isAccountExists
export const currentAccount = state => state.auth.currentAccount


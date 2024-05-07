import React, { createContext, useContext, useReducer } from "react";

// state provider using React Context API

const AppStateContext = createContext();

const initialState = {
    reqStatus: "",
    user: {
        token: ""
    },
    isLoggedIn: false
};

const SET_REQ_STATUS = "SET_REQ_STATUS";
const SET_USER = "SET_USER";
const SET_IS_LOGGED_IN = "SET_IS_LOGGED_IN"

const reducer = (state, action) => {
    switch (action.type) {
        case SET_REQ_STATUS:
            return { ...state, reqStatus: action.payload };
        case SET_USER:
            return { ...state, user: action.payload };
        case SET_IS_LOGGED_IN:
            return { ...state, isLoggedIn: action.payload };
        default:
            return state;
    }
};

export function AppStateProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    
    const setReqStatus = (status) => {
        dispatch({ type: SET_REQ_STATUS, payload: status });
    };

    const setUser = (userData) => {
        dispatch({ type: SET_USER, payload: userData });
    };

    const setIsLoggedIn = (status) => {
        dispatch({ type: SET_IS_LOGGED_IN, payload: status });
    }

    return (
        <AppStateContext.Provider
            value={{
                state,
                setReqStatus,
                setUser,
                setIsLoggedIn
            }}
        >
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error("useAppState must be used within an AppStateProvider");
    }
    return context;
}

import React, { useEffect, useState } from "react";
import { AppStateProvider, useAppState } from "./tools/context";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import { Landing } from "./components/landing";
import { Login } from "./components/login";
import { Register } from "./components/register";
import { UserView } from "./components/userview";
import { ToolBar } from "./components/toolbar";
import { NotFound } from "./components/notfound";
import { ResetPassword } from "./components/resetPassword";

const App = () => (
  <AppStateProvider>
    <ToolBar />
    <Router>
      <Routes>
        <Route exact path="/" element={<Landing />} />
        <Route exact path="/Login" element={<Login />} />
        <Route exact path="/Register" element={<Register />} />
        <Route exact path="/user" element={<UserView />} />
        <Route exact path="/resetPassword" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </AppStateProvider>
);

export default App;

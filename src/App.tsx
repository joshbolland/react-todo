import React, { useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Use Navigate for redirection
import "./App.css";
import Login from "./Login";
import SignUp from "./SignUp";
import { Category, Task } from "./types";
import useFirebaseConfig from "./hooks/useFirebaseConfig";
import useFirebaseAuth from "./hooks/useFirebaseAuth";

// Lazy load the components
const Navbar = lazy(() => import("./Navbar.jsx"));
const Categories = lazy(() => import("./Categories"));
const TaskList = lazy(() => import("./TaskList"));
const SettingsNav = lazy(() => import("./SettingsNav"));
const Settings = lazy(() => import("./Settings.js"));

function App() {
  const firebaseConfig = useFirebaseConfig();
  const { auth, user, setUser } = useFirebaseAuth(firebaseConfig);

  const [sidebarIsOpen, setSidebarIsOpen] = useState<boolean>(true); // Manage sidebar open state
  const [isDesktop, setIsDesktop] = useState<boolean>(true); // Desktop check workaround for styling purposes
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  return (
    <div className="flex flex-col ">
      <Routes>
        {/* Route for login */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" />
            ) : (
              <div className="flex w-full min-h-screen justify-center items-center">
                <Login setUser={setUser} auth={auth} />
              </div>
            )
          }
        />
        <Route path="/signup" element={<SignUp setUser={setUser} auth={auth} />} />

        {/* Route for dashboard */}
        <Route
          path="/"
          element={
            user ? (
              <div>
                <Suspense fallback={<div>Loading...</div>}>
                  <Navbar
                    auth={auth}
                    setUser={setUser}
                    sidebarIsOpen={sidebarIsOpen}
                    setSidebarIsOpen={setSidebarIsOpen}
                    isDesktop={isDesktop}
                  />
                  <div className="flex w-full min-h-[calc(100vh-80px)]">
                    <Categories
                      categories={categories}
                      setCategories={setCategories}
                      setTasks={setTasks}
                      user={user}
                      firebaseConfig={firebaseConfig}
                      sidebarIsOpen={sidebarIsOpen}
                      setSidebarIsOpen={setSidebarIsOpen}
                      isDesktop={isDesktop}
                      setIsDesktop={setIsDesktop}
                    />
                    <TaskList
                      categories={categories}
                      tasks={tasks}
                      setTasks={setTasks}
                      user={user}
                      firebaseConfig={firebaseConfig}
                      isDesktop={isDesktop}
                    />
                  </div>
                </Suspense>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/settings"
          element={
            user ? (
              <div className="bg-[#FCFAF8]">
                <Suspense fallback={<div>Loading...</div>}>
                  <SettingsNav auth={auth} setUser={setUser} />
                  <Settings user={user} />
                </Suspense>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
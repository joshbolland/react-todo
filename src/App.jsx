import React, { useEffect, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Use Navigate for redirection
import "./App.css";
import Login from "./Login";
import SignUp from "./SignUp";
import { initializeFirebase } from "./FBConfig";
import { onAuthStateChanged } from "firebase/auth";

// Lazy load the components
const Navbar = lazy(() => import("./Navbar"));
const Categories = lazy(() => import("./Categories"));
const TaskList = lazy(() => import("./TaskList"));
const SettingsNav = lazy(() => import("./SettingsNav"));
const Settings = lazy(() => import("./Settings"));

function App() {
  const [user, setUser] = useState(null); // Manage user state
  const [firebaseConfig, setFirebaseConfig] = useState(null); // Store firebase config
  const [auth, setAuth] = useState(null); // Store the auth object
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true); // Manage sidebar open state
  const [isDesktop, setIsDesktop] = useState(true); // Desktop check workaround for styling purposes
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);


  // Fetch Firebase config from Netlify function
  useEffect(() => {
    const fetchFirebaseConfig = async () => {
      try {
        const res = await fetch("/.netlify/functions/firebaseConfig");
        const data = await res.json();
        setFirebaseConfig(data.firebaseConfig);
      } catch (error) {
        console.error("Error fetching Firebase config:", error);
      }
    };

    fetchFirebaseConfig();
  }, []);

  // Initialize Firebase once the config is fetched
  useEffect(() => {
    if (firebaseConfig) {
      const { auth } = initializeFirebase(firebaseConfig);
      setAuth(auth); // Set the auth object in the state
    }
  }, [firebaseConfig]);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
    }
  }, [auth]);

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
                  <div className="flex w-full min-h-screen">
                    <Categories
                      categories={categories}
                      setCategories={setCategories}
                      tasks={tasks}
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
// App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Use Navigate for redirection
import "./App.css";
import TaskList from "./TaskList";
import Categories from "./Categories";
import Login from "./Login";
import Navbar from "./Navbar";
import { initializeFirebase } from "./FBConfig"; // Import auth to manage authentication
import { onAuthStateChanged } from "firebase/auth"; // Import signOut to handle logging out

function App() {
  const [user, setUser] = useState(null); // Manage user state
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [firebaseConfig, setFirebaseConfig] = useState(null); // Store firebase config
  const [auth, setAuth] = useState(null); // Store the auth object
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true); // Manage sidebar open state
  const [isDesktop, setIsDesktop] = useState(true);

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

        {/* Route for dashboard */}
        <Route
          path="/"
          element={
            user ? (
              <div>
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
                    allTasks={allTasks}
                    setAllTasks={setAllTasks}
                    user={user}
                    firebaseConfig={firebaseConfig}
                    isDesktop={isDesktop}
                  />
                </div>
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

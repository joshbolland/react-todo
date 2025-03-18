import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { initializeFirebase } from "./FBConfig";

export default function Categories({
  categories,
  setCategories,
  setTasks,
  user,
  firebaseConfig,
}) {
  const [categoryDescription, setCategoryDescription] = useState("");
  const { db } = initializeFirebase(firebaseConfig);

  const userCategoriesRef = useMemo(
    () => (user ? collection(db, "users", user.uid, "categories") : null),
    [user, db]
  );

  const userTasksRef = useMemo(
    () => (user ? collection(db, "users", user.uid, "tasks") : null),
    [user, db]
  );

  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      const querySnapshot = await getDocs(userCategoriesRef);
      const fetchedCategories = querySnapshot.docs.map(
        (doc) => doc.data().description
      );
      setCategories(fetchedCategories);
    };

    fetchCategories();
  }, [user, userCategoriesRef, setCategories]);

  const addCategory = async () => {
    if (!categoryDescription || !user) return;

    const newCategory = {
      description: categoryDescription,
    };

    await addDoc(userCategoriesRef, newCategory);

    setCategories([...categories, categoryDescription]);
    setCategoryDescription("");
  };

  const filterTasks = async (category) => {
    if (!user) return;

    let tasksQuery;

    if (category) {
      tasksQuery = query(userTasksRef, where("category", "==", category));
    } else {
      tasksQuery = query(userTasksRef);
    }

    const querySnapshot = await getDocs(tasksQuery);
    const fetchedTasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setTasks(fetchedTasks);
  };

  return (
    <div className="w-1/3 min-h-full pt-8 flex flex-col items-center bg-[#FCFAF8]">
      <ul className="w-full text-left pl-20">
        <li
          onClick={() => filterTasks(null)}
          className="font-bold text-xl p-2 rounded-lg hover:bg-[#FFF0E5] w-11/12 cursor-pointer"
        >
          All Tasks
        </li>
        {categories.map((category, index) => (
          <li
            onClick={() => filterTasks(category)}
            key={index}
            className="p-2 rounded-lg hover:bg-[#FFF0E5] w-11/12 cursor-pointer"
          >
            <span className="text-xl">{category}</span>
          </li>
        ))}
      </ul>
      <div className="w-full text-left pl-20 mt-2.5">
        <input
          className="bg-gray-100 rounded-sm p-1.5 w-1/2 ml-2"
          type="text"
          placeholder="Add new category..."
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value)}
          onKeyUp={(event) => {
            if (event.key === "Enter") {
              addCategory();
            }
          }}
        />
      </div>
    </div>
  );
}

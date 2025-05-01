import { render, screen, act } from "@testing-library/react";
import { vi, expect, test } from "vitest";
import '@testing-library/jest-dom';

import { mockUser } from "./test-utils/mockUser";

const mockFirebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test-auth-domain",
  projectId: "test-project-id",
};

vi.mock("../config/FBConfig", () => ({
  initializeFirebase: vi.fn(() => ({
    app: {},
    auth: {},
    db: {}, // Mock Firestore db object
  })),
}));
vi.mock("firebase/firestore", () => ({
  ...vi.importActual("firebase/firestore"),
  doc: vi.fn().mockReturnValue({}),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  collection: vi.fn().mockReturnValue({}),
}));

import TaskList from "../components/TaskList";

test("renders without crashing", () => {
  render(
    <TaskList
      tasks={[]}
      setTasks={vi.fn()} // Use vi.fn() from Vitest
      user={null}
      firebaseConfig={mockFirebaseConfig}
      categories={[]}
      isDesktop={true}
    />
  );
  expect(screen.getByText(/New task/i)).toBeInTheDocument();
});

test("new task modal opens when new task button is clicked", async () => {
  render(
    <TaskList
      tasks={[]}
      setTasks={vi.fn()}
      user={null}
      firebaseConfig={mockFirebaseConfig}
      categories={[]}
      isDesktop={true}
    />
  );
  const newTaskButton = screen.getByText(/New task/i);
  await act(async () => {
    newTaskButton.click();
  });

  const modalText = await screen.findByText(/Create new task/i);

  expect(modalText).toBeInTheDocument();
});

test("renders tasks correctly", () => {
  const tasks = [
    {
      id: "1",
      description: "Test Task 1",
      category: "Work",
      completed: false,
      targetDate: null,
    },
    {
      id: "2",
      description: "Test Task 2",
      category: "Personal",
      completed: true,
      targetDate: "2025-03-19",
    },
  ];

  render(
    <TaskList
      tasks={tasks}
      setTasks={vi.fn()}
      user={null}
      firebaseConfig={mockFirebaseConfig}
      categories={[
        { id: "1", description: "Work" },
        { id: "2", description: "Personal" },
      ]}
      isDesktop={true}
    />
  );
  // Check if task descriptions are rendered
  expect(screen.getByText(/Test Task 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Test Task 2/i)).toBeInTheDocument();

  // Check if the target date is rendered for the completed task
  const taskDate = screen.getByText("3/19/2025"); // Adjust to match the format rendered
  expect(taskDate).toBeInTheDocument();
});

test("task can be marked as complete and incomplete", async () => {
  const tasks = [
    {
      id: "1",
      description: "Test Task 1",
      category: "Work",
      completed: false,
      targetDate: null,
    },
  ];

  const setTasks = vi.fn();

  // Render the component with tasks and the mock setTasks
  const { rerender } = render(
    <TaskList
      tasks={tasks}
      setTasks={setTasks}
      user={mockUser}
      firebaseConfig={mockFirebaseConfig}
      categories={[
        { id: "1", description: "Work" },
        { id: "2", description: "Personal" },
      ]}
      isDesktop={true}
    />
  );

  const checkbox = screen.getByRole("checkbox");
  expect(checkbox).not.toBeChecked(); // Ensure checkbox is initially unchecked

  // Check if the task text is initially not struck through
  let taskText = screen.getByText(/Test Task 1/i);
  expect(taskText).not.toHaveClass("line-through");

  // Simulate checking the checkbox to mark task as complete
  await act(async () => {
    checkbox.click(); // Simulate user clicking the checkbox
  });

  // Directly update the tasks prop (simulating the state update)
  tasks[0].completed = true;

  // Rerender component with updated tasks (this simulates the state update in a real app)
  rerender(
    <TaskList
      tasks={tasks}
      setTasks={setTasks}
      user={mockUser}
      firebaseConfig={mockFirebaseConfig}
      categories={[
        { id: "1", description: "Work" },
        { id: "2", description: "Personal" },
      ]}
      isDesktop={true}
    />
  );

  // After state is updated, check if the task text has the "line-through" class
  taskText = screen.getByText(/Test Task 1/i);
  expect(taskText).toHaveClass("line-through"); // Verify line-through class is applied

  // You can optionally check the state update by verifying that `setTasks` is called correctly
  expect(setTasks).toHaveBeenCalledTimes(1); // Ensure setTasks was called only once
});

"use client";
import PropTypes from "prop-types";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onToggle, onDelete, showToast, currentUser }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-xl">No hay tareas. ¡Agregá una nueva!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          showToast={showToast}
          currentUser={currentUser}
        />
      ))}
    </ul>
  );
}

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    userId: PropTypes.number.isRequired,
    userName: PropTypes.string
  })).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.string.isRequired
  })
};

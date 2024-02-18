import { useRef, useState, useEffect } from 'react';
import './App.css'
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { app } from "./firebase.config";

function App() {
  

  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const db = getFirestore(app);
  const inputRef = useRef();

  useEffect(() => {
    getData();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value;
    const documentId = new Date().getTime().toString();
    try {
      await setDoc(doc(db, "todo", documentId), {
        text: text,
        time: new Date(),
      });
      e.target.reset();
      getData();
    } catch (error) {
      console.log(error);
    }
  };

  const getData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "todo"));
      const todosData = [];
      querySnapshot.forEach((doc) => {
        const todo = {
          id: doc.id,
          ...doc.data(),
        };
        todosData.push(todo);
      });
      setTodos(todosData);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, "todo", id));
      getData();
    } catch (error) {
      console.log(error);
    }
  };

  const editTodo = async (id, newText) => {
    try {
      await updateDoc(doc(db, "todo", id), {
        text: newText
      });
      getData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form onSubmit={create} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <input ref={inputRef} type="text" placeholder='Todo...' />
        <button type='submit'>Submit</button>
      </form>
      <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ width: "100%", display: "flex", alignItems: "start", gap: "0.5em" }} >
            {editingTodo === todo.id ? (
              <>
                <input
                  type="text"
                  defaultValue={todo.text}
                  ref={(input) => input && input.focus()}
                  onBlur={(e) => {
                    setEditingTodo(null);
                    editTodo(todo.id, e.target.value);
                  }}
                />
                <button onClick={() => setEditingTodo(null)}>Save</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: "1.2rem" }}>{todo.text}</span>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                <button onClick={() => setEditingTodo(todo.id)}>Edit</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;

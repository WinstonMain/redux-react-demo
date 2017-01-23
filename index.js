import expect from 'expect';
import ReactDOM from 'react-dom';
import React , {Component} from 'react';
import deepFreeze from 'deep-freeze';
import { createStore, combineReducers } from 'redux';


const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER' :
      return action.filter;

    default:
      return state;
  }

}

const todo = (state = {} , action) => {
  switch (action.type) {
    case 'ADD_TODO' :
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
      case 'TOGGLE_TODO' :
        if (action.id !== state.id) {
          return state;
        }
        return {
          ...state,
          completed : !state.completed
        };

    default:
      return state;
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO' :
      return [...state, todo(undefined, action)];
      case 'TOGGLE_TODO' :
        return state.map(t => { return todo(t, action)});
    default:
      return state;
  }
}

const todoApp = combineReducers ({
  todos,
  visibilityFilter
});


const Todo = ({
    onClick,
    completed,
    text
  }) => (
    <li
    style={
      {
    textDecoration: (completed) ? 'line-through' : '',
  }
    }
    onClick={onClick}
  >
  {text}
  </li>
);

const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo =>
    <Todo
      key={todo.id}
      {...todo}
      onClick={() => onTodoClick(todo.id)}
      />

      )}
  </ul>
)

const store = createStore(todoApp);

let nextTodoId = 0;
class TodoApp extends Component {
  render() {
    const visibleTodos = this.props.todos.filter(todo => {
      return ((!todo.completed && this.props.visibilityFilter!=='SHOW_COMPLETED') || (todo.completed && this.props.visibilityFilter!=='SHOW_IN_PROGRESS'))
    });

    return (
      <div>
        <input ref={node => {
          this.input = node;
        }} />
        <button onClick={() => {
          store.dispatch({
            type: 'ADD_TODO',
            text: this.input.value,
            id: nextTodoId++
          });
          this.input.value = '';
        }}>
          AddTodo
          </button>
          <TodoList
            todos = {visibleTodos}
            onTodoClick = { (id) => {
              store.dispatch({
                type: 'TOGGLE_TODO',
                id: id
              })
            }}
            />
          <FilterLink text='Show All' filter='SHOW_ALL'  />
          <br />
          <FilterLink text='Show in progress' filter='SHOW_IN_PROGRESS'/>
          <br />
          <FilterLink text='Show completed' filter='SHOW_COMPLETED'/>
      </div>
      );
  }
}

const FilterLink = ({text, filter}) => (
  <a
    href="#"
    onClick={ (e) => {
      e.preventDefault();
      store.dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: filter
      })
    }}
  >{text}</a>
);


const render = () => {
  ReactDOM.render(
    <TodoApp
      todos= {store.getState().todos}
      visibilityFilter = {store.getState().visibilityFilter}

    />,
  document.getElementById('root')
    );


};



store.subscribe(render);

render();

// --------test

const testTodos = () => {
  const before = [];

  const action = {
    type: 'ADD_TODO',
    id: 0,
    text: 'learn'
    
  }

  const after = [
  {
    id: 0,
    text: 'learn',
    completed: false
  }];

  deepFreeze(before);
  deepFreeze(action);

  expect (
    todos(before, action)
    )
    .toEqual(after);
};

testTodos();



const testToggleTodo = () => {
  const before = [{
    completed: false,
    id: 0,
    text: "foo"
  },{
    completed: false,
    id: 1,
    text: "bar"

  }];

  const action = {
    type: 'TOGGLE_TODO',
    id: 1
  };

  const after = [{
    completed: false,
    id: 0,
    text: "foo"
  },{
    completed: true,
    id: 1,
    text: "bar"

  }];


  deepFreeze(before);
  deepFreeze(action);

  expect (
    todos(before, action)
    )
    .toEqual(after);
};

testToggleTodo();




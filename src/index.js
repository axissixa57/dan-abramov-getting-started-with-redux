import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// ========================================
// ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
// ========================================
let nextTodoId = 0;

// ====== actions creators ======
const addTodo = (text) => {
    return {
        type: 'ADD_TODO',
        id: nextTodoId++,
        text
    }
}
const setVisibilityFilter = (filter) => {
    return {
        type: 'SET_VISIBILITY_FILTER',
        filter
    }
}
const toggleTodo = (id) => {
    return {
        type: 'TOGGLE_TODO',
        id
    };
};
// ====== actions creators ======

const todo = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false
            };
        case 'TOGGLE_TODO':
            if (state.id !== action.id) {
                return state;
            }
            return {
                ...state,
                completed: !state.completed
            };
        default:
            return state;
    }
}

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                todo(undefined, action)
            ]
        case 'TOGGLE_TODO':
            return state.map(t => todo(t, action))
        default:
            return state;
    }
};

const Todo = ({
    onClick,
    completed,
    text
}) => (
        <li onClick={onClick}
            style={{
                textDecoration: completed ? 'line-through' : 'none'
            }}
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
    );

let AddToDo = ({ dispatch }) => {
    let input;

    return (
        // компоненту нужен single-root element - поэтому добавляется div 
        <div>
            <input ref={node => {
                input = node;
            }} />
            <button onClick={() => {
                dispatch(addTodo(input.value));
                input.value = '';
            }}>
                Add Todo
            </button>
        </div>
    );
};
AddToDo = connect()(AddToDo);

const visibilityFilter = (
    state = 'SHOW_ALL',
    action
) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;
        default:
            return state;
    }
}

const Link = ({
    active,
    children,
    onClick
}) => {
    if (active) {
        return <span>{children}</span>
    }
    return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a href='#'
            onClick={e => {
                e.preventDefault();
                onClick();
            }}
        >
            {children}
        </a>
    );
};
// в ownProps будут знаносится данные из props из предыдущего компонента
const mapSateToLinkProps = (
    state,
    ownProps
) => {
    return {
        active: ownProps.filter === state.visibilityFilter
    };
};
const mapDispatchToLinkProps = (
    dispatch, ownProps
) => {
    return {
        onClick: () => dispatch(
            setVisibilityFilter(ownProps.filter)
        )
    }
}
const FilterLink = connect(
    mapSateToLinkProps,
    mapDispatchToLinkProps
)(Link)

const Footer = () => (
    <p>
        Show:
            {' '}
        <FilterLink filter='SHOW_ALL'>All</FilterLink>
        {', '}
        <FilterLink filter='SHOW_ACTIVE'>Active</FilterLink>
        {', '}
        <FilterLink filter='SHOW_COMPLETED'>Completed</FilterLink>
    </p>
);

const getVisibleTodos = (
    todos,
    filter
) => {
    // eslint-disable-next-line default-case
    switch (filter) {
        case 'SHOW_ALL':
            return todos;
        case 'SHOW_COMPLETED':
            return todos.filter(
                t => t.completed
            );
        case 'SHOW_ACTIVE':
            return todos.filter(
                t => !t.completed
            );
    }
}

const mapStateToTodoListProps = (state) => {
    return {
        todos: getVisibleTodos(
            state.todos,
            state.visibilityFilter
        )
    };
};
const mapDispatchTodoListProps = (dispatch) => {
    return {
        onTodoClick: (id) => {
            dispatch(toggleTodo(id))
        }
    };
};
const VisibleTodoList = connect(
    mapStateToTodoListProps,
    mapDispatchTodoListProps
)(TodoList);

const TodoApp = () => {
    return (
        <div>
            <AddToDo />
            <VisibleTodoList />
            <Footer />
        </div>
    );
}

const todoApp = combineReducers({
    todos,
    visibilityFilter
});

ReactDOM.render(
    <Provider store={createStore(todoApp)}>
        <TodoApp />
    </Provider>,
    document.getElementById('root')
);
import { useQuery, useApolloClient } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import Recommended from './components/Recommended';
import { ALL_BOOKS, ALL_AUTHORS, ME } from './queries';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const resultAuthors = useQuery(ALL_AUTHORS);
  const resultBooks = useQuery(ALL_BOOKS);
  const resultUser = useQuery(ME);
  const client = useApolloClient();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('books-user-token');
    if (loggedUserJSON) {
      setToken(loggedUserJSON);
    }
  }, [token]);

  if (resultAuthors.loading || resultBooks.loading || resultUser.loading) {
    return <div>loading...</div>;
  }

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>

        <Authors
          show={page === 'authors'}
          authors={resultAuthors.data.allAuthors}
        />

        <Books show={page === 'books'} books={resultBooks.data.allBooks} />

        <LoginForm
          show={page === 'login'}
          setToken={setToken}
          setPage={setPage}
        />
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommended')}>recommended</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors
        show={page === 'authors'}
        showAuthorForm={'loggedIn'}
        authors={resultAuthors.data.allAuthors}
      />

      <Books show={page === 'books'} books={resultBooks.data.allBooks} />

      <NewBook show={page === 'add'} />
      <Recommended
        show={page === 'recommended'}
        books={resultBooks.data.allBooks}
        user={resultUser.data.me}
      />
    </div>
  );
};

export default App;

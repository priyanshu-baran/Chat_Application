import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { Main } from './Main';
import { Entrance } from './Entrance';
import { Notify } from './Notify';

export const App = () => {
  return (
    <>
      <ToastContainer
        theme='dark'
        position='top-right'
        autoClose={3000}
      />
      <Router
        future={{
          v7_startTransition: true, // suppresses React Router v7 transition warning
          v7_relativeSplatPath: true, // suppresses splat route resolution warning
        }}>
        <Routes>
          <Route
            path='/'
            element={<Entrance />}
          />
          <Route
            path='/main'
            element={
              <>
                <Main />
                <Notify />
              </>
            }
          />
        </Routes>
      </Router>
    </>
  );
};

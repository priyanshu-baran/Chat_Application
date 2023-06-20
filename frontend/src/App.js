import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';

import { Main } from './Main';
import { Test } from './Test';
import { Entrance } from './Entrance';
import { Notify } from './Notify';

export const App = () => {
  const [online, setOnline] = useState(true);
  return (
    <>
      <ToastContainer theme='dark'></ToastContainer>
      <Router>
        <Routes>
          <Route
            path='/'
            element={<Entrance online={online} />}
          />
          <Route
            path='/main'
            element={
              <>
                <Main online={online} />
                <Notify
                  online={online}
                  setOnline={setOnline}
                />
              </>
            }
          />
          <Route
            path='/test'
            element={<Test />}
          />
        </Routes>
      </Router>
    </>
  );
};

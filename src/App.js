import { useEffect } from 'react';
import './App.css';
import FirstPage from './FirstPage.js';
import { Route, Router, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import ExamPage from './examPage';
import Test from './test';
import ViewUsers from './viewUsers';
function App() {

  return (
    <div >
      {/* <FirstPage /> */}
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<FirstPage />}></Route>
          <Route  path="/exam" element={<ExamPage />}></Route>
          <Route  path="/test" element={<Test />}></Route>
          <Route  path="/view" element={<ViewUsers />}></Route>
        </Routes>
      </BrowserRouter>
      {/* <Router>
        <div>
          <Route exact path="/" component={examPage} />
        </div>
      </Router> */}
    </div>
  );
}

export default App;

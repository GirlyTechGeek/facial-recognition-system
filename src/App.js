import { useEffect } from 'react';
import './App.css';
import FirstPage from './FirstPage.js';
import { Route, Router, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import ExamPage from './examPage';
function App() {

  return (
    <div >
      {/* <FirstPage /> */}
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<FirstPage />}></Route>
          <Route  path="/exam" element={<ExamPage />}></Route>
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

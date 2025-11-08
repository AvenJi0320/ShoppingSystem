import Test from "./pages/test/Test.tsx";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shop from "./pages/shop/Shop.tsx";
import Login from "./pages/login/Login.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/test' element={<Test />} />
                <Route path='/shop' element={<Shop />} />
                <Route path='/login' element={<Login />} />
            </Routes>
        </Router>
    )
}

export default App
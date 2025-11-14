import Test from "./pages/test/Test.tsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Shop from "./pages/shop/Shop.tsx";
import Login from "./pages/login/Login.tsx";
import FinishCart from "./pages/cart/FinishCart.tsx";
import Order from "./pages/order/Order.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Navigate to="/login" replace />} />
                <Route path='/test' element={<Test />} />
                <Route path='/shop' element={<Shop />} />
                <Route path='/login' element={<Login />} />
                <Route path='/finish_cart' element={<FinishCart />} />
                <Route path='/order' element={<Order />} />
            </Routes>
        </Router>
    )
}

export default App
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Items from './pages/Items.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetails from './pages/OrderDetails.jsx'
import OrderForm from './pages/OrderForm.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Protected from './components/Protected.jsx'
import Admin from './pages/Admin.jsx'
import Customers from './pages/Customers.jsx'
import CustomerDetails from './pages/CustomerDetails.jsx'
import Cart from './pages/Cart.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './styles.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Items /> },
      { path: 'cart', element: <Cart /> },
      { path: 'orders', element: <Orders /> },
      { path: 'orders/new', element: (
        <Protected>
          <OrderForm mode="create" />
        </Protected>
      ) },
      { path: 'orders/:id', element: <OrderDetails /> },
      { path: 'orders/:id/edit', element: (
        <Protected>
          <OrderForm mode="edit" />
        </Protected>
      ) },
      { path: 'admin', element: (
        <Protected requireAdmin={true} requirePhone="9999999999"> 
          <Admin />
        </Protected>
      ) },
      { path: 'customers', element: (
        <Protected requireAdmin={true} requirePhone="9999999999">
          <Customers />
        </Protected>
      ) },
      { path: 'customers/:id', element: (
        <Protected requireAdmin={true} requirePhone="9999999999">
          <CustomerDetails />
        </Protected>
      ) },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </React.StrictMode>
)


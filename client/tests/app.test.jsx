import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import App from '../src/App'
import Home from '../src/pages/Home'

describe('App smoke', () => {
  it('renders navbar links', () => {
    const router = createMemoryRouter([
      { path: '/', element: <App />, children: [{ index: true, element: <Home /> }] }
    ])
    render(<RouterProvider router={router} />)
    expect(screen.getByText('Order Tracking')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
  })
})


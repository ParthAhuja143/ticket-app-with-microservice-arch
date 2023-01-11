import Link from 'next/link';
import React from 'react'

const Header = ({ currentUser }) => {
    const links = [
        !currentUser && {label: 'Sign Up', href: '/auth/signup'},
        !currentUser && {label: 'Sign In', href: '/auth/signin'},
        currentUser && {label: 'Sign Out', href: '/auth/signout'},
    ]
    .filter(linkConfig => linkConfig)
    .map(({label, href}) => {
        return (
            <li className='p-2' key={href}>
                <Link href={href}>
                    {label}
                </Link>
            </li>
        )
    })
  return (
    <nav className='navbar navbar-light bg-light p-2'>
        <Link href='/'>
            <span className="navbar-brand">ParthTickets</span>
        </Link>
        <div className='d-flex justify-content-end'>
            <ul className='nav d-flex align-items-center'>
                {links}
            </ul>
        </div>
    </nav>
  )
}

export default Header;
import Router from 'next/router';
import React, { useState } from 'react'
import useRequest from '../../hooks/useRequest';

const Signin = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin', 
        method: 'post', 
        body: {
            email, password
        },
        onSuccess: () => Router.push('/')
    });

    const onSubmit = async (event) => {
        event.preventDefault();
        doRequest();
    }

  return (
    <div className='container mt-5'>
        <form onSubmit={onSubmit} className='d-flex flex-column justify-content-center align-items-center'>
            <h1>Sign Up</h1>
            <div className='form-group mt-5'>
                <label>Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className='form-control' />
            </div>
            <div className='form-group mt-2'>
                <label>Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type='password' className='form-control' />
            </div>
            {errors && <div className='alert alert-danger mt-2'>
                <h4>Oops...</h4>
                <ul className='my-0'>
                    {
                        errors.map((error) => {
                            return <li>
                                {error.message}
                            </li>
                        })
                    }
                </ul>
            </div>}
            <button className='btn btn-primary mt-5'>Sign in</button>
        </form>
    </div>
  )
}

export default Signin
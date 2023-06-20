/* eslint-disable jsx-a11y/anchor-is-valid */

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

import { data } from '.';
const socket = io('http://localhost:5000');

export const Entrance = ({ online }) => {
  const initialValues = () => {
    setLoginStuff({ email: '', pass: '' });
    setSignupStuff({ name: '', email: '', pass: '', copass: '' });
    setShowHide({
      for: {
        for1: 'hide',
        for2: 'hide',
      },
      in: {
        in1: true,
        in2: true,
      },
    });
  };
  const usenavigate = useNavigate('');
  const icon = useRef(null);
  const [toggle, setToggle] = useState(true);
  const [showHide, setShowHide] = useState({
    for: {
      for1: 'hide',
      for2: 'hide',
    },
    in: {
      in1: true,
      in2: true,
    },
  });
  const [loginStuff, setLoginStuff] = useState({
    email: '',
    pass: '',
  });
  const [signupStuff, setSignupStuff] = useState({
    name: '',
    email: '',
    pass: '',
    copass: '',
  });
  const [toggleButton, setToggleButton] = useState({
    facebook: 'Login with Facebook',
    google: 'Login with Google',
  });
  const handleLogIn = (e) => {
    e.preventDefault();
    console.log({ ...loginStuff });
  };
  const handleSignUp = (e) => {
    e.preventDefault();
    console.log({ ...signupStuff });
    initialValues();
  };
  const handleToggle = () => {
    setToggle(!toggle);
    toggle
      ? setToggleButton({
          facebook: 'Signup with Facebook',
          google: 'Signup with Google',
        })
      : setToggleButton({
          facebook: 'Login with Facebook',
          google: 'Login with Google',
        });
    initialValues();
  };
  const handleSignInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(data.auth, provider)
      .then(() => {
        const username = data.auth.currentUser.displayName;
        const email = data.auth.currentUser.email;
        const password = username
          .split(' ')
          .reverse()
          .map((word) => word.split('').reverse().join(''))
          .join('')
          .toLowerCase();
        const isLoggedIn = online;
        let obj = { username, email, password, isLoggedIn };
        axios
          .get(`${data.react_url}/users/`)
          .then((res) => {
            const extract = res.data.filter((user) => user.email === email);
            if (extract.length === 0) {
              axios
                .post(`${data.react_url}/users/add`, obj)
                .then((res) => {
                  toast.success('Registered Successfully');
                  socket.emit('loggedIn', data.auth.currentUser);
                  usenavigate('/main');
                })
                .catch((err) => {
                  console.error(err);
                });
            } else {
              toast.error('User already exists');
              handleLogInWithGoogle();
            }
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleLogInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(data.auth, provider)
      .then(() => {
        const email = data.auth.currentUser.email;
        axios
          .get(`${data.react_url}/users/`)
          .then((res) => {
            const existingUser = res.data.find((user) => user.email === email);
            if (existingUser) {
              toast.success('Logged in Successfully');
              socket.emit('loggedIn', data.auth.currentUser);
              usenavigate('/main');
            } else {
              toast.error('Please sign up before logging in');
            }
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSignOutWithGoogle = () => {
    data.auth.signOut();
    sessionStorage.removeItem('user');
  };
  const handleShowHide = () => {
    const val = icon.current.id;
    const key = `for${val.charAt(val.length - 1)}`;
    const input = `in${val.charAt(val.length - 1)}`;
    setShowHide((prevState) => {
      const updatedFor = {
        ...prevState.for,
        [key]: prevState.for[key] === 'hide' ? 'show' : 'hide',
      };
      const updatedIn = {
        ...prevState.in,
        [input]: !prevState.in[input],
      };
      return {
        for: updatedFor,
        in: updatedIn,
      };
    });
  };
  return (
    <section className='entry_container forms'>
      {toggle ? (
        <div className='form login'>
          <div className='form-content'>
            <header>Login</header>
            <form onSubmit={handleLogIn}>
              <div className='field input-field'>
                <input
                  type='email'
                  placeholder='Email'
                  className='input'
                  value={loginStuff.email}
                  onChange={(e) =>
                    setLoginStuff({ ...loginStuff, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className='field input-field'>
                <input
                  type={`${showHide.in.in1 ? 'password' : 'text'}`}
                  placeholder='Password'
                  className='password'
                  value={loginStuff.pass}
                  onChange={(e) =>
                    setLoginStuff({ ...loginStuff, pass: e.target.value })
                  }
                  required
                />
                <i
                  onClick={handleShowHide}
                  ref={icon}
                  id='ref1'
                  className={`bx bx-${showHide.for.for1} eye-icon`}></i>
              </div>
              <div className='form-link'>
                <a className='forgot-pass'>Forgot password?</a>
              </div>
              <div className='field button-field'>
                <button>Login</button>
              </div>
            </form>
            <div className='form-link'>
              <span>
                Don't have an account?{' '}
                <a
                  onClick={handleToggle}
                  className='link signup-link'>
                  Signup
                </a>
              </span>
            </div>
          </div>
          <div className='line'></div>
          <div
            onClick={handleSignOutWithGoogle}
            className='media-options'>
            <a className='field facebook'>
              <i className='bx bxl-facebook facebook-icon'></i>
              <span>{toggleButton.facebook}</span>
            </a>
          </div>
          <div
            onClick={handleLogInWithGoogle}
            className='media-options'>
            <a className='field google'>
              <img
                src='google.png'
                alt=''
                className='google-img'
              />
              <span>{toggleButton.google}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className='form signup'>
          <div className='form-content'>
            <header>Signup</header>
            <form onSubmit={handleSignUp}>
              <div className='field input-field'>
                <input
                  type='text'
                  placeholder='Full Name'
                  className='input'
                  value={signupStuff.name}
                  onChange={(e) =>
                    setSignupStuff({ ...signupStuff, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className='field input-field'>
                <input
                  type='email'
                  placeholder='Email'
                  className='input'
                  value={signupStuff.email}
                  onChange={(e) =>
                    setSignupStuff({ ...signupStuff, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className='field input-field'>
                <input
                  type={`${showHide.in.in2 ? 'password' : 'text'}`}
                  placeholder='Create password'
                  className='password'
                  value={signupStuff.pass}
                  onChange={(e) =>
                    setSignupStuff({ ...signupStuff, pass: e.target.value })
                  }
                  required
                />
                <i
                  onClick={handleShowHide}
                  ref={icon}
                  id='ref2'
                  className={`bx bx-${showHide.for.for2} eye-icon`}></i>
              </div>
              <div className='field input-field'>
                <input
                  type='password'
                  placeholder='Confirm password'
                  className='password'
                  value={signupStuff.copass}
                  onChange={(e) =>
                    setSignupStuff({ ...signupStuff, copass: e.target.value })
                  }
                  required
                />
              </div>
              <div className='field button-field'>
                <button>Signup</button>
              </div>
            </form>
            <div className='form-link'>
              <span>
                Already have an account?{' '}
                <a
                  onClick={handleToggle}
                  className='link login-link'>
                  Login
                </a>
              </span>
            </div>
          </div>
          <div className='line'></div>
          <div
            // onClick={handleSignOutWithGoogle}
            className='media-options'>
            <a className='field facebook'>
              <i className='bx bxl-facebook facebook-icon'></i>
              <span>{toggleButton.facebook}</span>
            </a>
          </div>
          <div
            onClick={handleSignInWithGoogle}
            className='media-options'>
            <a className='field google'>
              <img
                src='google.png'
                alt=''
                className='google-img'
              />
              <span>{toggleButton.google}</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

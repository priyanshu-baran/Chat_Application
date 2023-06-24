/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { data } from '.';
const socket = io('http://localhost:5000');

export const Entrance = () => {
  const initialValues = () => {
    setLoginStuff({ email: '', pass: '' });
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
  const [toggleButton, setToggleButton] = useState({
    facebook: 'Login with Facebook',
    google: 'Login with Google',
  });
  const handleLogIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(data.auth, loginStuff.email, loginStuff.pass)
      .then(() => {
        const email = data.auth.currentUser.email;
        axios.get(`${data.react_url}/users/`).then((res) => {
          const existingUser = res.data.find((user) => user.email === email);
          if (existingUser) {
            toast.success('Logged in Successfully');
            socket.emit('loggedIn', {
              details: data.auth.currentUser,
              name: existingUser.username,
            });
            usenavigate('/main');
          } else {
            toast.error('Please signup first before logging in');
          }
        });
      })
      .catch((err) => {
        toast.error('User not found');
        initialValues();
        console.log(err);
      });
  };
  const handleSignUp = (values) => {
    const { username, email, password } = values;
    createUserWithEmailAndPassword(data.auth, email, password)
      .then(() => {
        const obj = { username, password, email };
        axios
          .get(`${data.react_url}/users/`)
          .then((res) => {
            const extract = res.data.filter((user) => user.email === email);
            if (extract.length === 0) {
              axios
                .post(`${data.react_url}/users/add`, obj)
                .then(() => {
                  toast.success('Registered Successfully');
                  socket.emit('loggedIn', {
                    details: data.auth.currentUser,
                    name: obj.username,
                  });
                  usenavigate('/main');
                })
                .catch((err) => {
                  console.error(err);
                });
            } else {
              toast.error('User already exists');
            }
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
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
        let obj = { username, email, password };
        axios
          .get(`${data.react_url}/users/`)
          .then((res) => {
            const extract = res.data.filter((user) => user.email === email);
            if (extract.length === 0) {
              axios
                .post(`${data.react_url}/users/add`, obj)
                .then(() => {
                  toast.success('Registered Successfully');
                  socket.emit('loggedIn', {
                    details: data.auth.currentUser,
                    name: data.auth.currentUser.displayName,
                  });
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
              socket.emit('loggedIn', {
                details: data.auth.currentUser,
                name: data.auth.currentUser.displayName,
              });
              usenavigate('/main');
            } else {
              toast.error('Please signup first before logging in');
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
  const handleSignInWithFacebook = () => {
    toast.info('Feature comming soon..!!');
  };
  const handleLogInWithFacebook = () => {
    toast.info('Feature comming soon..!!');
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
  useEffect(() => {
    sessionStorage.removeItem('user');
  }, []);
  const validationSchema = Yup.object({
    username: Yup.string().required('*Name is required'),
    email: Yup.string()
      .required('*Email is required')
      .matches(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email address'),
    password: Yup.string()
      .required('*Password is required')
      .min(8, 'Password is too small'),
    coPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('*Confirm Password is required'),
  });
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
            onClick={handleLogInWithFacebook}
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
            <Formik
              initialValues={{
                username: '',
                email: '',
                password: '',
                coPassword: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSignUp}>
              <Form>
                <div className='field input-field'>
                  <Field
                    type='text'
                    name='username'
                    placeholder='Full Name'
                    className='input'
                    autoComplete='off'
                  />
                  <ErrorMessage
                    name='username'
                    component='div'
                    className='error'
                  />
                </div>
                <div className='field input-field'>
                  <Field
                    type='email'
                    name='email'
                    placeholder='Email'
                    className='input'
                    autoComplete='off'
                  />
                  <ErrorMessage
                    name='email'
                    component='div'
                    className='error'
                  />
                </div>
                <div className='field input-field'>
                  <Field
                    type={showHide.in.in2 ? 'password' : 'text'}
                    name='password'
                    placeholder='Create password'
                    className='password'
                    autoComplete='off'
                  />
                  <ErrorMessage
                    name='password'
                    component='div'
                    className='error'
                  />
                  <i
                    onClick={handleShowHide}
                    ref={icon}
                    id='ref2'
                    className={`bx bx-${showHide.for.for2} eye-icon`}></i>
                </div>
                <div className='field input-field'>
                  <Field
                    type='password'
                    name='coPassword'
                    placeholder='Confirm password'
                    className='password'
                    autoComplete='off'
                  />
                  <ErrorMessage
                    name='coPassword'
                    component='div'
                    className='error'
                  />
                </div>
                <div className='field button-field'>
                  <button type='submit'>Signup</button>
                </div>
              </Form>
            </Formik>
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
            onClick={handleSignInWithFacebook}
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

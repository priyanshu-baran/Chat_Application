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
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { data } from '.';

export const Entrance = () => {
  const navigate = useNavigate('');
  const icon = useRef(null);
  const [toggle, setToggle] = useState(true);
  const [loginStuff, setLoginStuff] = useState({ email: '', pass: '' });
  const [showHide, setShowHide] = useState({
    for: { for1: 'hide', for2: 'hide' },
    in: { in1: true, in2: true },
  });
  const [toggleButton, setToggleButton] = useState({
    facebook: 'Login with Facebook',
    google: 'Login with Google',
  });
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) navigate('/main');
  }, [navigate]);
  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        data.auth,
        loginStuff.email,
        loginStuff.pass,
      );
      toast.success('Logged in successfully');
      navigate('/main');
    } catch (err) {
      toast.error('Email or password is incorrect');
    }
  };
  const handleSignUp = async (values) => {
    const { username, email, password } = values;
    let firebaseUser = null;
    try {
      const cred = await createUserWithEmailAndPassword(
        data.auth,
        email,
        password,
      );
      firebaseUser = cred.user;
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/add`, {
        username,
        email,
        password,
        firebaseUid: firebaseUser.uid,
      });
      toast.success('Registered successfully');
      navigate('/main');
    } catch (err) {
      if (firebaseUser && err.response) {
        await firebaseUser.delete().catch(() => {});
      }
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Email is already registered');
      } else if (err.response?.status === 409) {
        toast.error('Username or email is already taken');
      } else {
        toast.error('Something went wrong — please try again');
        console.error(err);
      }
    }
  };
  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await signInWithPopup(data.auth, provider);
      const { uid, email, displayName } = cred.user;
      await axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/users/add`, {
          username: displayName,
          email,
          password: uid,
          firebaseUid: uid,
        })
        .catch((err) => {
          if (err.response?.status !== 409) throw err;
        });
      toast.success(
        toggle ? 'Logged in successfully' : 'Registered successfully',
      );
      navigate('/main');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed');
        console.error(err);
      }
    }
  };
  const handleToggle = () => {
    setToggle((prev) => !prev);
    setToggleButton(
      toggle
        ? { facebook: 'Signup with Facebook', google: 'Signup with Google' }
        : { facebook: 'Login with Facebook', google: 'Login with Google' },
    );
    setLoginStuff({ email: '', pass: '' });
    setShowHide({
      for: { for1: 'hide', for2: 'hide' },
      in: { in1: true, in2: true },
    });
  };
  const handleShowHide = () => {
    const val = icon.current.id;
    const key = `for${val.charAt(val.length - 1)}`;
    const input = `in${val.charAt(val.length - 1)}`;
    setShowHide((prev) => ({
      for: { ...prev.for, [key]: prev.for[key] === 'hide' ? 'show' : 'hide' },
      in: { ...prev.in, [input]: !prev.in[input] },
    }));
  };
  const validationSchema = Yup.object({
    username: Yup.string().required('*Name is required').min(3, 'Too short'),
    email: Yup.string()
      .required('*Email is required')
      .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email'),
    password: Yup.string()
      .required('*Password is required')
      .min(8, 'Min 8 characters'),
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
                  type={showHide.in.in1 ? 'password' : 'text'}
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
                  className={`bx bx-${showHide.for.for1} eye-icon`}
                />
              </div>
              <div className='form-link'>
                <a className='forgot-pass'>Forgot password?</a>
              </div>
              <div className='field button-field'>
                <button type='submit'>Login</button>
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
          <div className='line' />
          <div
            onClick={() => toast.info('Feature coming soon..!!')}
            className='media-options'>
            <a className='field facebook'>
              <i className='bx bxl-facebook facebook-icon' />
              <span>{toggleButton.facebook}</span>
            </a>
          </div>
          <div
            onClick={handleGoogle}
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
                    className={`bx bx-${showHide.for.for2} eye-icon`}
                  />
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
          <div className='line' />
          <div
            onClick={() => toast.info('Feature coming soon..!!')}
            className='media-options'>
            <a className='field facebook'>
              <i className='bx bxl-facebook facebook-icon' />
              <span>{toggleButton.facebook}</span>
            </a>
          </div>
          <div
            onClick={handleGoogle}
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

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import styles from "../css/Login.module.css";

const Login = (props) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    try {
      event.preventDefault();
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const authToken = data.token;
        localStorage.setItem('authToken', authToken);
        props.onLogin();
        navigate("/dashboard");
        handleSetRole();
      } else {
        console.error('Login failed.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSetRole = async () => {
    const storedToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}/auth/role`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const loggedRole = data.rolePermissions.role;
        localStorage.setItem("userRole", loggedRole);
        props.onSetUserRole();
      } else {
        console.log("Role failed")
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className={styles.login_container}>
      <h2>Login</h2>
      <form onSubmit={(e) => handleLogin(e)} className={styles.login_form}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={credentials.username}
          onChange={handleInputChange}
          className={styles.login_input}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={credentials.password}
          onChange={handleInputChange}
          className={styles.login_input}
        />
        <button type="submit" className={styles.login_button}>
          Login
        </button>
      </form>
    </div>
  );
};


export default Login;

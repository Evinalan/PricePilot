import { useState } from "react";
import { loginUser } from "../api/authApi";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const data = await loginUser({
        email,
        password
      });

      localStorage.setItem("token", data.token);

      alert("Login successful!");

    } catch (error) {

      console.log(error);

      alert("Login failed!");

    }
  };

  return (
    <div>

      <h1>Login</h1>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}

export default Login;
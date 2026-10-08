import { useState } from "react";
import { registerUser } from "../api/authApi";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      const data = await registerUser({
        name,
        email,
        password
      });

      console.log(data);

      alert("Registration successful!");

    } catch (error) {

      console.log(error);

      alert("Registration failed!");

    }
  };

  return (
    <div>

      <h1>Create Account</h1>

      <form onSubmit={handleRegister}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />

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
          Register
        </button>

      </form>

    </div>
  );
}

export default Register;
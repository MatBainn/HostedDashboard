import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { ref, get, child } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/Login.css";
import loginImage from "../assets/dashboard-login-img.png";
import HandymanLogo from "../assets/handyman_fakeLogo.png";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(validatePassword(value));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    setEmailValid(isEmailValid);
    setPasswordValid(isPasswordValid);

    if (!isEmailValid || !isPasswordValid) return;

    try {
      setIsLoading(true);
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "admin"));

      if (snapshot.exists()) {
        const admins = snapshot.val();
        const adminList = Object.entries(admins)
          .filter(([key]) => key !== "test")
          .map(([id, data]) => ({ id, ...data }));

        const foundUser = adminList.find((user) => user.email === email);

        if (!foundUser) {
          setError("Email not found.");
        } else if (foundUser.password !== password) {
          setError("Incorrect password.");
        } else if (foundUser.status !== "active") {
          setError(
            "This account is currently inactive.<br />Please contact Master Admin for support."
          );
        } else {
          localStorage.setItem("currentUser", JSON.stringify(foundUser));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", foundUser.role);
          navigate("/dashboard", { state: { user: foundUser } });
        }
      } else {
        setError("No admin users found.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to database. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="row vh-100">
        <img
          src={loginImage}
          alt="Handyman"
          className="h-100 col-md-6 d-none d-md-flex align-items-center justify-content-center object-fit-cover"
        />

        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="login-box">
            <img
              src={HandymanLogo}
              alt="Handyman Logo"
              width="150"
              className="mx-auto d-block"
            />
            <h3 className="text-left mt-3">Login to Dashboard</h3>
            <p className="text-left text-muted">
              Enter your credentials to access admin dashboard
            </p>

            <form onSubmit={handleLogin} noValidate>
              {error && (
                <div
                  className="alert alert-danger d-flex align-items-center"
                  role="alert"
                  style={{
                    maxWidth: "100%",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    overflowWrap: "break-word",
                  }}
                >
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  <span dangerouslySetInnerHTML={{ __html: error }}></span>
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className={`form-control ${
                    emailValid === null
                      ? ""
                      : emailValid
                      ? "is-valid"
                      : "is-invalid"
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setEmailValid(validateEmail(email))}
                  required
                />
                <div className="invalid-feedback">
                  Please enter a valid email address.
                </div>
                <div className="valid-feedback">Looks good!</div>
              </div>

              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={`form-control ${
                    passwordValid === null
                      ? ""
                      : passwordValid
                      ? "is-valid"
                      : "is-invalid"
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setPasswordValid(validatePassword(password))}
                  required
                />
                <div className="invalid-feedback">
                  Password must be at least 6 characters long.
                </div>
                <div className="valid-feedback">Looks good!</div>

                <Link
                  to="/forgot-password"
                  className="ms-auto small text-decoration-none"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="text-center mt-3">
              <span>Need Help? </span>
              <Link to="/forgot-password" className="text-primary">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

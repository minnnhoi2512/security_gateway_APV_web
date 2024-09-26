import { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import LoginImg from '../assets/login-img.jpeg';
import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../services/user.service';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode

function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const [loginUser, { isLoading, isError, isSuccess }] = useLoginUserMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const result = await loginUser({ email, password }).unwrap();
      const { jwtToken } = result;

      // Save the token in localStorage (or any store)
      localStorage.setItem('jwtToken', jwtToken);

      // Decode the token
      const decodedToken: any = jwtDecode(jwtToken);
      // Save the decoded token in localStorage or store
      localStorage.setItem('userRole', decodedToken.role);
      localStorage.setItem('userId', result.userId);
      localStorage.setItem('userName', result.userName);
      // Navigate to dashboard after successful login
      navigate(`/dashboard`);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          className="object-cover w-full h-full"
          src={LoginImg}
          alt="Modern office building"
        />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <LockOutlined className="text-4xl text-blue-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Security Gate Apache</h2>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Địa chỉ email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserOutlined className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockOutlined className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Quên mật khẩu?
                </a>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              {isError && <p className="text-red-500 mt-2">Đăng nhập thất bại. Vui lòng thử lại.</p>}
              {isSuccess && <p className="text-green-500 mt-2">Đăng nhập thành công!</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

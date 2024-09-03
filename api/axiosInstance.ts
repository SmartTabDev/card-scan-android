import axios from 'axios';

// Create an instance of Axios with your custom configuration
const axiosInstance = axios.create({
  baseURL: 'http://198.46.177.72:5000',
  timeout: 30000,
  // Other common configuration options...
});

// Add common request headers or other configuration options
// axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
//   config.headers.common.Authorization = 'Bearer YourAccessToken'; // Set your authorization token here
//   return config;
// });
// Add any default headers or interceptors if needed
// axiosInstance.defaults.headers.common.Authorization = 'Bearer <your-token>';

// Export the Axios instance
export default axiosInstance;

import axios from "axios";

// Axios Interceptor for Adding Authorization Header
axios.interceptors.request.use(
  function (config) {
    const { origin } = new URL(config.url);
    const allowedOrigins = [process.env.REACT_APP_BASE_ENDPOINT];
    const token = localStorage.getItem("access-token");

    if (allowedOrigins.includes(origin) && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Axios Interceptor for Response Debugging
axios.interceptors.response.use(
  function (response) {
    // Log successful responses for auth endpoints (helpful for debugging)
    if (response.config.url.includes('/auth/')) {
      console.log('Auth API response:', response.config.url, response.data);
    }
    return response;
  },
  function (error) {
    // Log failed responses
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Fetch Product List
export const fetchProductList = async ({ pageParam = 1 }) => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_BASE_ENDPOINT}/product?page=${pageParam}`
  );
  return data;
};

// Fetch Single Product
export const fetchProduct = async (id) => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_BASE_ENDPOINT}/product/${id}`
  );
  return data;
};

// Add New Product (Authenticated)
export const postProduct = async (input) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_BASE_ENDPOINT}/product/`,
    input
  );
  return data;
};

// Register User
export const fetcRegister = async (input) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_ENDPOINT}/auth/register`,
      input
    );
    
    // Log the raw response for debugging
    console.log('Register response raw:', response);
    
    if (!response.data) {
      console.error('Register response has no data');
      throw new Error('Invalid registration response format');
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

// Login User
export const fetchLogin = async (input) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_ENDPOINT}/auth/login`,
      input
    );
    
    // Log the raw response for debugging
    console.log('Login response raw:', response);
    
    if (!response.data) {
      console.error('Login response has no data');
      throw new Error('Invalid login response format');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Fetch User Info (Authenticated)
export const fetchMe = async () => {
  try {
    // Check if token exists
    const token = localStorage.getItem("access-token");
    if (!token) {
      console.log("No token found, user is not logged in");
      return {};
    }
    
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_ENDPOINT}/auth/me`
    );
    
    console.log("fetchMe response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error.response?.data || error.message);
    
    // If unauthorized, clear tokens
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log("Unauthorized in fetchMe, clearing tokens");
      localStorage.removeItem("access-token");
      localStorage.removeItem("refresh-token");
    }
    
    return {};
  }
};

// Logout User (Authenticated)
export const fetchLogout = async () => {
  const refreshToken = localStorage.getItem("refresh-token");

  if (!refreshToken) {
    console.warn("No refresh token found");
    return { message: "Already logged out" };
  }

  const { data } = await axios.post(
    `${process.env.REACT_APP_BASE_ENDPOINT}/auth/logout`,
    { refresh_token: refreshToken }
  );

  return data;
};

// Place Order (Authenticated)
export const postOrder = async (input) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_BASE_ENDPOINT}/order`,
    input
  );
  return data;
};

// Fetch Orders (Authenticated)
export const fetchOrders = async () => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_BASE_ENDPOINT}/order`
  );
  return data;
};

// Delete Product (Authenticated)
export const deleteProduct = async (product_id) => {
  const { data } = await axios.delete(
    `${process.env.REACT_APP_BASE_ENDPOINT}/product/${product_id}`
  );
  return data;
};

// Update Product (Authenticated)
export const updateProduct = async (input, product_id) => {
  const { data } = await axios.put(
    `${process.env.REACT_APP_BASE_ENDPOINT}/product/${product_id}`,
    input
  );
  return data;
};

// Fetch Reviews for a Product
export const fetchReviews = async (product_id) => {
  try {
    // Use the public endpoint that doesn't require authentication
    const { data } = await axios.get(
      `${process.env.REACT_APP_BASE_ENDPOINT}/public/reviews/product/${product_id}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Return empty array instead of throwing error to handle gracefully
    return [];
  }
};

// Mark an order as delivered (Admin only)
export const markOrderAsDelivered = async (order_id) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_BASE_ENDPOINT}/delivery/admin/deliver/${order_id}`
  );
  return data;
};

// Submit a New Review (Authenticated)
export const submitReview = async (product_id, reviewData) => {
  const token = localStorage.getItem("access-token");

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const { data } = await axios.post(
    `${process.env.REACT_APP_BASE_ENDPOINT}/review/`,
    {
      product_id: product_id,
      ...reviewData,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

// Verify SDC before submitting review
export const verifySDC = async (product_id, sdc) => {
  const { data } = await axios.post(
    `${process.env.REACT_APP_BASE_ENDPOINT}/delivery/verifySDC`,
    {
      product_id,
      sdc
    }
  );
  return data;
};

// Fetch user's deliveries
export const fetchUserDeliveries = async () => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_BASE_ENDPOINT}/delivery/my-deliveries`
  );
  return data;
};

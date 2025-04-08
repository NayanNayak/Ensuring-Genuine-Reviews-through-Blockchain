import React, { useState } from "react";
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import validationSchema from "./validations";
import { fetchLogin } from "../../../api";
import { useAuth } from "../../../contexts/AuthContext";
import { handleAuthError } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Signin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, bag) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const loginResponse = await fetchLogin({
          email: values.email,
          password: values.password,
        });
        
        // Check if the response has the expected structure
        if (!loginResponse || !loginResponse.accessToken) {
          console.error("Invalid login response:", loginResponse);
          setError("Server returned an invalid response. Please try again.");
          return;
        }
        
        // Call the login function with the response and check the result
        const loginSuccess = login(loginResponse);
        if (!loginSuccess) {
          setError("Failed to process login response. Please try again.");
          return;
        }
        
        // Redirect to homepage after successful login
        navigate('/');
      } catch (e) {
        console.error("Login error details:", e);
        setError(handleAuthError(e));
      } finally {
        setIsLoading(false);
      }
    },
  });
  return (
    <div>
      <Flex align="center" width="full" justifyContent="center">
        <Box pt={10} width="400px">
          <Box textAlign="center">
            <Heading>Sign In</Heading>
          </Box>
          
          {error && (
            <Box my={4}>
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </Box>
          )}
          
          <Box my={5} textAlign="left">
            <form onSubmit={formik.handleSubmit}>
              <FormControl 
                isInvalid={formik.touched.email && formik.errors.email} 
                mb={4}
              >
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  placeholder="Your email address"
                />
                <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl 
                isInvalid={formik.touched.password && formik.errors.password}
                mb={4}
              >
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  placeholder="Your password"
                />
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              </FormControl>

              <Button 
                mt={4} 
                width="full" 
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Signing in"
              >
                Sign In
              </Button>
              
              <Text mt={4} fontSize="sm" textAlign="center">
                Don't have an account? <Text as="span" color="blue.500" cursor="pointer" onClick={() => navigate('/signup')}>Sign up</Text>
              </Text>
            </form>
          </Box>
        </Box>
      </Flex>
    </div>
  );
}

export default Signin;

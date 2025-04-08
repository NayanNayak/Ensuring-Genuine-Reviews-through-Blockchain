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
import { fetcRegister } from "../../../api";
import { useAuth } from "../../../contexts/AuthContext";
import { handleAuthError } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
    validationSchema,
    onSubmit: async (values, bag) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const registerResponse = await fetcRegister({
          email: values.email,
          password: values.password,
        });
        
        // Check if the response has the expected structure
        if (!registerResponse || !registerResponse.accessToken) {
          console.error("Invalid registration response:", registerResponse);
          setError("Server returned an invalid response. Please try again.");
          return;
        }
        
        // Call the login function with the response and check the result
        const loginSuccess = login(registerResponse);
        if (!loginSuccess) {
          setError("Failed to process registration response. Please try again.");
          return;
        }
        
        // Redirect to homepage after successful registration
        navigate('/');
      } catch (e) {
        console.error("Registration error details:", e);
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
            <Heading>Sign Up</Heading>
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
                  placeholder="Minimum 10 characters"
                />
                <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl 
                isInvalid={formik.touched.passwordConfirm && formik.errors.passwordConfirm}
                mb={4}
              >
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="passwordConfirm"
                  type="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.passwordConfirm}
                  placeholder="Confirm your password"
                />
                <FormErrorMessage>{formik.errors.passwordConfirm}</FormErrorMessage>
              </FormControl>

              <Button 
                mt={4} 
                width="full" 
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Creating account"
              >
                Sign Up
              </Button>
              
              <Text mt={4} fontSize="sm" textAlign="center">
                Already have an account? <Text as="span" color="blue.500" cursor="pointer" onClick={() => navigate('/signin')}>Sign in</Text>
              </Text>
            </form>
          </Box>
        </Box>
      </Flex>
    </div>
  );
}

export default Signup;

import * as yup from "yup";

const validations = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(10, "Password must be at least 10 characters")
    .required("Password is required"),
});

export default validations;

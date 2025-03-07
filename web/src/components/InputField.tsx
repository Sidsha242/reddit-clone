import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useField } from "formik";
import * as React from "react";

//Generic Input Field we can use everywhere

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; //label is required
  name: string; //name is required
}; //take props that regular input field would take

const InputField: React.FunctionComponent<InputFieldProps> = ({
  label,
  size: _, //we dont want size to be passed to input field(dosent like size..its takes it off the props)
  ...props
}) => {
  const [field, { error }] = useField(props); //special hook from formik...casting error(string) to bool
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;

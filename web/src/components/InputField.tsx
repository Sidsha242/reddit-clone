import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import * as React from "react";

//Generic Input Field we can use everywhere

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; //label is required
  name: string; //name is required
  textarea?: boolean;
}; //take props that regular input field would take

const InputField: React.FunctionComponent<InputFieldProps> = ({
  label,
  textarea,
  size: _, //we dont want size to be passed to input field(dosent like size..its takes it off the props)
  ...props
}) => {
  let InputOrTextarea = Input;
  if (textarea) {
    InputOrTextarea = Textarea;
  }
  const [field, { error }] = useField(props); //special hook from formik...casting error(string) to bool
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextarea
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

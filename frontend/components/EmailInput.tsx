"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";

export function EmailInput() {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(true);

  const placeholders = [
    "What's your company email?",
    "Enter your email address",
    "Please provide your email",
    "Email us at your convenience",
    "e.g. example@gmail.com",
  ];

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(validateEmail(value));
    console.log("Email:", value, "Valid:", validateEmail(value));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = validateEmail(email);
    setIsValid(valid);
    if (valid) {
      toast("Thank you! Your email has been submitted.");
    } else {
  
    toast("Please enter a valid email address.")
    }
  };

  return (
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
  );
}

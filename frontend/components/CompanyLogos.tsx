"use client";
import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

const companyLogos = [
  { src: "/companies/bnm-logo.png", alt: "BNM Logo" },
  { src: "/companies/hilti-logo.jpg", alt: "Hilti Logo" },
  { src: "/companies/petronas-logo.png", alt: "Petronas Logo" },
];

export function CompanyLogos() {
  return (
    <section className="w-full max-w-4xl text-center py-16">
      <h2 className="text-3xl sm:text-4xl font-bold mb-8">
        Join companies like these hiring with Hirelah
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 items-center justify-center">
        {companyLogos.map((logo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex justify-center items-center p-4 bg-white rounded-lg shadow-md"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={150}
              height={100}
              objectFit="contain"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
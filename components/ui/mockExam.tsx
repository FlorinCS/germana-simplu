"use client";

import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/lib/auth";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import TelcExamApp from "@/components/ui/telc_exams_components";

export default function MockExam() {
  


  return (
    <div className="max-w-8xl space-y-6 bg-white w-full">
      <TelcExamApp />
    </div>
  );
}

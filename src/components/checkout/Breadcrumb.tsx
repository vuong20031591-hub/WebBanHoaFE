"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/src/contexts";

interface BreadcrumbProps {
  currentStep: "bag" | "details" | "complete";
}

export function Breadcrumb({ currentStep }: BreadcrumbProps) {
  const router = useRouter();
  const { locale } = useLocale();

  const labels =
    locale === "vi"
      ? { bag: "GIO", details: "CHI TIET", complete: "HOAN TAT" }
      : { bag: "BAG", details: "DETAILS", complete: "COMPLETE" };

  const steps = [
    { id: "bag", label: labels.bag, path: "/cart" },
    { id: "details", label: labels.details, path: "/checkout" },
    { id: "complete", label: labels.complete, path: null },
  ];

  const getStepColor = (stepId: string) => {
    if (stepId === currentStep) {
      return "text-[#8a6d5d]";
    }
    
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) {
      return "text-[#9ca3af]";
    }
    
    return "text-[#d1d5db]";
  };

  const handleStepClick = (step: typeof steps[0]) => {
    if (!step.path) return;
    
    const stepIndex = steps.findIndex(s => s.id === step.id);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) {
      router.push(step.path);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const stepIndex = steps.findIndex(s => s.id === step.id);
        const currentIndex = steps.findIndex(s => s.id === currentStep);
        const isClickable = step.path && stepIndex < currentIndex;
        
        return (
          <div key={step.id} className="flex items-center gap-2">
            <span
              onClick={() => handleStepClick(step)}
              className={`text-[10px] font-semibold leading-[15px] tracking-[1px] ${
                getStepColor(step.id)
              } ${isClickable ? "cursor-pointer hover:opacity-70 transition" : ""}`}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="text-[10px] font-semibold leading-[15px] tracking-[1px] text-[#d1d5db]">
                /
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

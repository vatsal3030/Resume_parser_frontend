"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/ui/ModelSelector";

export function RegenerateBlock({ onRegenerate, isGenerating, currentModelId = "default" }) {
  const [modelId, setModelId] = useState(currentModelId);

  return (
    <div className="mt-8 bg-brutal-bg border-4 border-brutal-black p-6 shadow-[4px_4px_0_rgba(0,0,0,1)]">
      <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-brutal-black pb-2 inline-block">
        Regenerate Branch
      </h3>
      <p className="text-sm font-bold text-gray-600 mb-6">
        Want a different result? Select an AI model and generate a new branch. It will be saved in your history.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block font-black text-sm mb-2 uppercase">Select AI Model</label>
          <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} hideLabel={true} />
        </div>
        <Button 
          variant="brutal" 
          className="w-full sm:w-auto text-lg py-6 bg-brutal-yellow text-black border-4 border-brutal-black hover:shadow-none hover:translate-y-1 transition-all"
          onClick={() => onRegenerate(modelId)}
          disabled={isGenerating}
        >
          {isGenerating ? (
             <span className="flex items-center gap-2 animate-pulse">
               <Sparkles className="w-5 h-5" /> Regenerating...
             </span>
          ) : (
             <span className="flex items-center gap-2">
               <Sparkles className="w-5 h-5" /> Regenerate
             </span>
          )}
        </Button>
      </div>
    </div>
  );
}

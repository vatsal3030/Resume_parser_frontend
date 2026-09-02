"use client";
import { useState } from"react";
import { Sparkles } from"lucide-react";
import { Button } from"@/components/ui/button";
import { ModelSelector } from"@/components/ui/ModelSelector";

export function RegenerateBlock({ onRegenerate, isGenerating, currentModelId ="default" }) {
 const [modelId, setModelId] = useState(currentModelId);

 return (
 <div className="mt-8 bg-(--canvas) border border-(--hairline) p-6 shadow-sm">
 <h3 className="text-xl font-medium mb-4 border-b border-(--hairline) pb-2 inline-block">
 Regenerate Branch
 </h3>
 <p className="text-sm font-bold text-gray-600 mb-6">
 Want a different result? Select an AI model and generate a new branch. It will be saved in your history.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 items-end">
 <div className="flex-1 w-full">
 <label className="block font-medium text-sm mb-2">Select AI Model</label>
 <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} hideLabel={true} />
 </div>
 <Button 
 variant="default" 
 className="w-full sm:w-auto text-lg py-6 bg-(--primary) text-black border border-(--hairline) hover:shadow-sm hover:translate-y-1 transition-all"
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

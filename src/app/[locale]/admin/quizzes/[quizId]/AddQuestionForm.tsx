"use client";

import { addQuestion } from "@/lib/actions/quiz";
import { QuestionType } from "@prisma/client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface AddQuestionFormProps {
  quizId: string;
}

export default function AddQuestionForm({ quizId }: AddQuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [text, setText] = useState("");
  const [type, setType] = useState<QuestionType>("MULTIPLE_CHOICE");
  const [points, setPoints] = useState("1");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [error, setError] = useState("");

  const showOptions = type === "MULTIPLE_CHOICE" || type === "MULTIPLE_SELECT" || type === "TRUE_FALSE";

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: "text" | "isCorrect", value: string | boolean) => {
    const updated = [...options];
    if (field === "text") {
      updated[index].text = value as string;
    } else {
      // For single choice, only one can be correct
      if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
        updated.forEach((opt, i) => {
          opt.isCorrect = i === index ? (value as boolean) : false;
        });
      } else {
        updated[index].isCorrect = value as boolean;
      }
    }
    setOptions(updated);
  };

  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType === "TRUE_FALSE") {
      setOptions([
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: false },
      ]);
    } else if (newType === "SHORT_ANSWER") {
      setOptions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Question text is required");
      return;
    }

    if (showOptions) {
      const validOptions = options.filter((o) => o.text.trim());
      if (validOptions.length < 2) {
        setError("At least 2 options are required");
        return;
      }
      if (!validOptions.some((o) => o.isCorrect)) {
        setError("Please mark at least one correct answer");
        return;
      }
    }

    startTransition(async () => {
      const result = await addQuestion(quizId, {
        text: text.trim(),
        type,
        points: parseInt(points) || 1,
        explanation: explanation.trim() || undefined,
        options: showOptions
          ? options.filter((o) => o.text.trim()).map((o) => ({
            text: o.text.trim(),
            isCorrect: o.isCorrect,
          }))
          : undefined,
      });

      if (result.success) {
        // Reset form
        setText("");
        setExplanation("");
        setPoints("1");
        setOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ]);
        router.refresh();
      } else {
        setError(result.error || "Failed to add question");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="space-y-5">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Question Type</label>
          <div className="flex flex-wrap gap-2">
            {(["MULTIPLE_CHOICE", "MULTIPLE_SELECT", "TRUE_FALSE", "SHORT_ANSWER"] as QuestionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === t
                    ? "bg-primary text-black"
                    : "bg-accent/50 border border-border hover:border-primary/50"
                  }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Question *</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your question..."
            rows={2}
            className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Options */}
        {showOptions && (
          <div>
            <label className="block text-sm font-medium mb-2">Answer Options</label>
            <div className="space-y-2">
              {options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type={type === "MULTIPLE_SELECT" ? "checkbox" : "radio"}
                    name="correctAnswer"
                    checked={option.isCorrect}
                    onChange={(e) => handleOptionChange(idx, "isCorrect", e.target.checked)}
                    className="w-5 h-5 accent-primary"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(idx, "text", e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    disabled={type === "TRUE_FALSE"}
                    className="flex-1 px-4 py-2 bg-accent/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  {options.length > 2 && type !== "TRUE_FALSE" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {type !== "TRUE_FALSE" && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Plus size={14} />
                Add Option
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Points */}
          <div>
            <label className="block text-sm font-medium mb-2">Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              className="w-full px-4 py-2 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Explanation (shown after answering)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Optional: Explain the correct answer..."
            rows={2}
            className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {isPending && <Loader2 size={18} className="animate-spin" />}
          Add Question
        </button>
      </div>
    </form>
  );
}

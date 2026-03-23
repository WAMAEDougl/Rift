"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";

const subscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
}

export default function TextGenerateEffect({
  words,
  className = "",
  duration = 0.5,
}: TextGenerateEffectProps) {
  const isClient = useIsClient();
  const wordsArray = words.split(" ");

  if (!isClient) {
    return <span className={className}>{words}</span>;
  }

  return (
    <span className={className}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration,
            delay: idx * 0.08,
            ease: "easeOut",
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

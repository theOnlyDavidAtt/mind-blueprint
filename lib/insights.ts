import type { Band, TraitKey } from "./scoring";

// Local, instant descriptions (used even without an AI key).
export const INSIGHTS: Record<TraitKey, Record<Band, string>> = {
  O: {
    low: "You prefer proven methods and concrete facts. You are practical and grounded, and you tend to distrust ideas that have no clear use.",
    medium: "You balance curiosity with practicality. You can explore new ideas but you do not need constant novelty.",
    high: "You are curious, imaginative and drawn to abstract ideas. New concepts and unusual angles energize you.",
  },
  C: {
    low: "You work flexibly and spontaneously. Rigid plans and routines drain you, but deadlines and details need extra systems.",
    medium: "You can organize yourself when it matters and relax when it does not. Structure helps you but does not own you.",
    high: "You are organized, reliable and goal-driven. You follow through, plan ahead and hold yourself to high standards.",
  },
  E: {
    low: "You recharge alone and prefer depth over breadth. You tend to think before you speak and work best in calm settings.",
    medium: "You switch between social energy and quiet time. You can enjoy groups without needing them all the time.",
    high: "You gain energy from people, talk easily and like being in the middle of things. Variety and contact keep you motivated.",
  },
  A: {
    low: "You are direct and independent-minded. You say what you think and negotiate hard, which can feel blunt to others.",
    medium: "You are cooperative but able to stand your ground. You weigh harmony and your own interests case by case.",
    high: "You are warm, trusting and considerate. You build harmony easily but may avoid conflict or put others first too often.",
  },
  S: {
    low: "You feel pressure and emotions intensely. This makes you attentive and prepared, but stress and worry can build up.",
    medium: "You handle most stress well, with occasional dips under sustained pressure. Recovery habits matter for you.",
    high: "You stay calm under pressure and recover quickly from setbacks. Others often see you as a steady presence.",
  },
};

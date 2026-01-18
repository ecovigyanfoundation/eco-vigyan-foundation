"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Enhanced animation component with multiple unique variants
 * Each animation style provides a distinct, premium feel
 */
export default function FramerAnimation({
    children,
    delay = 0,
    duration = 0.8,
    className = "",
    variant = "reveal", // reveal, float, morph, glow, cascade
}) {
    // Reveal: Mask-based reveal with blur
    const revealVariants = {
        hidden: {
            opacity: 0,
            y: 60,
            filter: "blur(10px)",
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            transition: {
                duration: duration * 1.2,
                delay,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    // Float: Organic floating entrance with rotation
    const floatVariants = {
        hidden: {
            opacity: 0,
            y: 40,
            x: -20,
            rotate: -3,
            scale: 0.9,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            rotate: 0,
            scale: 1,
            transition: {
                duration: duration * 1.3,
                delay,
                ease: [0.34, 1.56, 0.64, 1],
            },
        },
    };

    // Morph: 3D perspective morph
    const morphVariants = {
        hidden: {
            opacity: 0,
            rotateX: -15,
            rotateY: 10,
            scale: 0.85,
            transformPerspective: 1200,
            filter: "blur(6px)",
        },
        visible: {
            opacity: 1,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            transformPerspective: 1200,
            filter: "blur(0px)",
            transition: {
                duration: duration * 1.4,
                delay,
                ease: [0.215, 0.61, 0.355, 1],
            },
        },
    };

    // Glow: Fade in with expanding glow effect
    const glowVariants = {
        hidden: {
            opacity: 0,
            scale: 0.92,
            filter: "blur(8px) brightness(1.5)",
        },
        visible: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px) brightness(1)",
            transition: {
                duration: duration * 1.1,
                delay,
                ease: [0.4, 0.0, 0.2, 1],
            },
        },
    };

    // Cascade: Staggered slide from side
    const cascadeVariants = {
        hidden: {
            opacity: 0,
            x: 80,
            skewX: -5,
        },
        visible: {
            opacity: 1,
            x: 0,
            skewX: 0,
            transition: {
                duration: duration * 1.2,
                delay,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    // Rise: Elegant vertical rise with scale
    const riseVariants = {
        hidden: {
            opacity: 0,
            y: 100,
            scale: 0.8,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: duration * 1.5,
                delay,
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        },
    };

    // Unfold: Paper-like unfolding effect
    const unfoldVariants = {
        hidden: {
            opacity: 0,
            scaleY: 0.3,
            originY: 0,
            filter: "blur(4px)",
        },
        visible: {
            opacity: 1,
            scaleY: 1,
            filter: "blur(0px)",
            transition: {
                duration: duration * 1.3,
                delay,
                ease: [0.34, 1.56, 0.64, 1],
            },
        },
    };

    // Select variant based on prop
    const getVariants = () => {
        switch (variant) {
            case "float": return floatVariants;
            case "morph": return morphVariants;
            case "glow": return glowVariants;
            case "cascade": return cascadeVariants;
            case "rise": return riseVariants;
            case "unfold": return unfoldVariants;
            default: return revealVariants;
        }
    };

    return (
        <motion.div
            className={className}
            variants={getVariants()}
            initial="hidden"
            whileInView="visible"
            viewport={{
                once: true,
                amount: 0.15,
            }}
            style={{ 
                transformStyle: "preserve-3d",
                willChange: "transform, opacity, filter",
            }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Staggered container for child animations
 */
export function StaggerContainer({
    children,
    className = "",
    staggerDelay = 0.1,
    delay = 0,
}) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay,
                staggerChildren: staggerDelay,
                delayChildren: delay,
            },
        },
    };

    return (
        <motion.div
            className={className}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
        >
            {children}
        </motion.div>
    );
}

/**
 * Individual stagger child item
 */
export function StaggerItem({
    children,
    className = "",
}) {
    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            filter: "blur(6px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    return (
        <motion.div
            className={className}
            variants={itemVariants}
        >
            {children}
        </motion.div>
    );
}

/**
 * Text reveal animation - word by word
 */
export function TextReveal({
    text,
    className = "",
    delay = 0,
    wordDelay = 0.05,
}) {
    const words = text.split(" ");

    return (
        <motion.span
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    className="inline-block mr-[0.3em]"
                    variants={{
                        hidden: { 
                            opacity: 0, 
                            y: 20,
                            filter: "blur(4px)",
                        },
                        visible: {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            transition: {
                                duration: 0.5,
                                delay: delay + (index * wordDelay),
                                ease: [0.22, 1, 0.36, 1],
                            },
                        },
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.span>
    );
}

/**
 * Parallax scroll animation
 */
export function ParallaxElement({
    children,
    className = "",
    speed = 0.5,
}) {
    return (
        <motion.div
            className={className}
            initial={{ y: 0 }}
            whileInView={{ y: speed * -50 }}
            viewport={{ once: false }}
            transition={{ 
                type: "tween",
                ease: "linear",
            }}
        >
            {children}
        </motion.div>
    );
}

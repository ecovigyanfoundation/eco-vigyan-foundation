"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Safe fade-in + slight upward animation.
 * This avoids layout shifts caused by x-axis transforms.
 */
export default function FramerAnimation({
    children,
    delay = 0,
    duration = 1.0,
    className = "",
}) {

    const fadeInUp = {
        hidden: {
            opacity: 0,
            y: 20, // small vertical offset (does NOT break layout)
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration,
                delay,
                ease: [0.4, 0.0, 0.2, 1], // smooth animation easing
            },
        },
    };

    return (
        <motion.div
            className={className}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{
                once: true,
                amount: 0.2, // trigger when 20% is visible
            }}
        >
            {children}
        </motion.div>
    );
}

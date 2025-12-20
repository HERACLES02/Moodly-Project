"use client"
import React from "react"
import { Check, X, Sparkles } from "lucide-react"
import "./Subscription.css"

const SubscriptionComponent = () => {
  const tiers = [
    {
      name: "Free",
      price: "৳0",
      description: "Basic mood setting",
      features: [
        { text: "Songs only", included: true },
        { text: "24/7 Radio Session", included: true },
        { text: "Ads on radio session", included: true, isNegative: true },
        { text: "HD Quality", included: false },
        { text: "Movies & TV", included: false },
        { text: "Group Streaming", included: false },
      ],
      buttonText: "Current Plan",
      highlight: false,
    },
    {
      name: "Monthly",
      price: "৳30",
      description: "The full cinematic experience",
      features: [
        { text: "Songs + Movies", included: true },
        { text: "Radio + TV", included: true },
        { text: "No ads", included: true },
        { text: "HD Quality", included: true },
        { text: "Custom Group Streaming", included: true },
        { text: "More Chat Features", included: true },
      ],
      buttonText: "Upgrade Monthly",
      highlight: false,
    },
    {
      name: "Yearly",
      price: "৳300",
      priceCut: "৳360",
      description: "Best value for cinephiles",
      features: [
        { text: "Songs + Movies", included: true },
        { text: "Radio + TV", included: true },
        { text: "No ads", included: true },
        { text: "HD Quality", included: true },
        { text: "Custom Group Streaming", included: true },
        { text: "More Chat Features", included: true },
        { text: "Cineplex Sponsored Benefits", included: true },
      ],
      buttonText: "Get Yearly Access",
      highlight: true,
    },
  ]

  return (
    <div className="sub-container">
      <header className="relative">
        <div className="sub-header-glow" />
        <h1 className="sub-title">
          Moodly <span className="text-accent-dynamic">Premium</span>
        </h1>
      </header>

      <div className="tier-grid">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`theme-card relative flex flex-col p-8 ${
              tier.highlight ? "premium-card" : "opacity-90"
            }`}
          >
            {/* The Badge - Fixed with higher z-index */}
            {tier.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--background)] px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 whitespace-nowrap z-[20] shadow-[0_4_15px_rgba(0,0,0,0.3)]">
                <Sparkles size={14} strokeWidth={3} /> BEST VALUE
              </div>
            )}

            <h2 className="text-2xl font-bold">{tier.name}</h2>

            <div className="flex flex-col mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{tier.price}</span>
                {tier.priceCut && (
                  <span className="text-xl line-through opacity-40 decoration-[var(--accent)] decoration-2">
                    {tier.priceCut}
                  </span>
                )}
              </div>
              <span className="opacity-50 text-sm font-bold tracking-widest uppercase mt-1">
                {tier.name === "Yearly" ? "per year" : "per month"}
              </span>
            </div>

            <p className="text-sm opacity-70 mt-4 leading-relaxed">
              {tier.description}
            </p>

            <ul className="feature-list">
              {tier.features.map((feature, fIdx) => (
                <li
                  key={fIdx}
                  className={`feature-item ${!feature.included ? "feature-disabled" : ""}`}
                >
                  {feature.included ? (
                    <Check
                      size={18}
                      className="text-[var(--accent)] shrink-0"
                      strokeWidth={3}
                    />
                  ) : (
                    <X size={18} className="shrink-0 opacity-50" />
                  )}
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            <button
              className={
                tier.highlight
                  ? "theme-button-primary w-full py-4 text-lg"
                  : "theme-button w-full py-4"
              }
            >
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubscriptionComponent

export const primaryNav = [
  { label: "Protein", href: "/shop/protein" },
  { label: "Creatine", href: "/shop/creatine" },
  { label: "Pre-Workout", href: "/shop/pre-workout" },
  { label: "Amino Acids", href: "/shop/amino-acids" },
  { label: "Daily deal", href: "/#daily-deal" },
  { label: "About", href: "/about" },
] as const;

export const footerNav = {
  shop: [
    { label: "Shop all", href: "/shop" },
    { label: "Muscle gain", href: "/shop?goal=muscle-gain" },
    { label: "Mass & weight gain", href: "/shop?goal=mass-gain" },
    { label: "Fat burn", href: "/shop?goal=fat-burn" },
    { label: "Performance", href: "/shop?goal=performance" },
    { label: "Health", href: "/shop?goal=health" },
    { label: "Daily deal", href: "/#daily-deal" },
    { label: "Protein", href: "/shop/protein" },
    { label: "Creatine", href: "/shop/creatine" },
    { label: "Pre-Workout", href: "/shop/pre-workout" },
    { label: "Amino Acids", href: "/shop/amino-acids" },
    { label: "Mass Gainers", href: "/shop/mass-gainers" },
    { label: "Carnitine & Energy", href: "/shop/carnitine-energy" },
    { label: "Daily Health", href: "/shop/daily-health" },
  ],
  help: [
    { label: "Contact and support", href: "/contact" },
    { label: "Shipping and delivery", href: "/policies/shipping" },
    { label: "Returns and refunds", href: "/policies/returns" },
  ],
  company: [
    { label: "About FORGE", href: "/about" },
    { label: "Favourites", href: "/favorites" },
    { label: "Cart", href: "/cart" },
  ],
  legal: [
    { label: "Privacy policy", href: "/policies/privacy" },
    { label: "Terms and conditions", href: "/policies/terms" },
    { label: "Shipping policy", href: "/policies/shipping" },
    { label: "Returns policy", href: "/policies/returns" },
  ],
} as const;

export const popularSearches = ["whey", "creatine", "raspberry", "mass gainer", "carnitine", "omega"];

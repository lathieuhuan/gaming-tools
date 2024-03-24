/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const colors = require("tailwindcss/colors");

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern: /text-rarity-(1|2|3|4|5)/,
    },
    {
      pattern: /bg-rarity-(1|2|3|4|5)/,
    },
    "text-pyro",
    "text-hydro",
    "text-electro",
    "text-dendro",
    "text-geo",
    "text-cryo",
    "text-anemo",
    "bg-pyro",
    "bg-hydro",
    "bg-electro",
    "bg-dendro",
    "bg-geo",
    "bg-cryo",
    "bg-anemo",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "640px",
      xm: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    colors: {
      transparent: colors.transparent,
      white: "#ffffff",
      black: "#000000",
      "hint-color": "#b8b8b8", // white-8 // bg-hint-color
      "light-default": "#ebebeb", // white-3
      surface: {
        1: "#050926",
        2: "#151a40",
        3: "#2c315c",
        border: "#535582",
      },
      primary: {
        1: "#edc73d",
        2: "#f5dc6e", // modified from #f1d46a (variant of primary-1) // check if really need
      },
      secondary: {
        1: "#09bcba"
      },
      danger: {
        1: "#cc0300", // root
        2: "#ff7370", // variant of danger-1
        3: "#ff8785", // variant of danger-1
        max: "#f43f5e",
      },
      "bonus-color": "#62f98e",
      "active-color": "#89fba9", // variant of bonus-color
      "link-color": "#5ca8ff", // variant of #0075ff
      "heading-color": "#fa8a12",
      pyro: "#ff504a",
      hydro: "#2eaaff",
      dendro: "#49e03e",
      electro: "#cd77ff",
      anemo: "#3effa2",
      cryo: "#75faff",
      geo: "#ffc558",
      rarity: {
        1: "#808080",
        2: "#49e03e",
        3: "#8bb6ff",
        4: "#e32eff",
        5: "#ffd700",
      },
    },
    extend: {
      borderWidth: {
        3: "3px",
      },
      borderRadius: {
        circle: "50%",
        "2.5xl": "2rem",
      },
      boxShadow: {
        common: "rgb(0 0 0 / 20%) 0px 3px 3px -2px, rgb(0 0 0 / 14%) 0px 3px 4px 0px, rgb(0 0 0 / 12%) 0px 1px 8px 0px",
        "white-glow": "0 0 3px #b8b8b8",
      },
      flexBasis: {
        "1/8": "12.5%",
      },
      fontSize: {
        "1.5xl": "1.375rem",
        "2.5xl": [
          "1.75rem",
          {
            lineHeight: 1.2,
          },
        ],
      },
      lineHeight: {
        base: 1.35,
      },
      width: {
        18: "4.5rem",
        68: "17rem",
        75: "18.75rem",
        76: "19rem",
      },
      maxWidth: {
        "1/3": "33.333333%",
        "1/4": "25%",
        "1/5": "20%",
        "1/6": "16.666666%",
        "1/8": "12.5%",
      },
      height: {
        18: "4.5rem",
        "98/100": "98%",
      },
      transformOrigin: {
        "bottom-center": "bottom center",
      },
      transitionProperty: {
        size: "height, width",
      },
      transitionDuration: {
        400: "400ms",
      },
    },
  },
  plugins: [],
};

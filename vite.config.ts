import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import pkg from "./package.json" with { type: "json" }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Inject package.json#version at build time so axios can stamp
  // `X-App-Version` on every request for server-side correlation and
  // client-version gating.
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },
  build: {
    // Modern browsers only — we're not serving IE11. Smaller output +
    // faster parse than the default ES2020 target.
    target: "esnext",
    // Raise the "this chunk is big" warning threshold — the main app
    // chunk (layout + sidebars + header + providers) legitimately sits
    // around 600 KB uncompressed and we've already code-split everything
    // else that can be lazy.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Hand-rolled vendor splitting. Each bucket becomes its own chunk
        // so:
        //   (a) a single app deploy only invalidates the `app` chunks,
        //       not the vendor ones — returning users keep hitting CDN
        //       cache for React, Leaflet, Recharts, etc.
        //   (b) heavy libraries used by a minority of pages (maps,
        //       charts, globe, motion) download on demand instead of
        //       blocking the first paint.
        // Order matters: earlier matches win, so list leaf libraries
        // before their parent packages when relevant.
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return;
          // Map rendering — leaflet ships its own large CSS + algorithms,
          // only needed on live-map / shipment detail.
          if (/node_modules\/(leaflet|react-leaflet|@react-leaflet)/.test(id)) {
            return "vendor-leaflet";
          }
          // Charting — recharts + d3 internals pull in ~400KB. Dashboard
          // and Reports are the only consumers.
          if (
            /node_modules\/(recharts|d3-|victory-vendor|internmap|react-smooth|decimal\.js|fast-equals|recharts-scale)/.test(
              id,
            )
          ) {
            return "vendor-charts";
          }
          // Sea-route solver — ships with world maritime GeoJSON, ~200KB
          // minified. Only the shipment route map calls into it, so it
          // piggybacks on the leaflet chunk.
          if (/node_modules\/(searoute-ts)/.test(id)) {
            return "vendor-leaflet";
          }
          // WebGL globe — cobe + its phong shader dependencies. Only on
          // the landing Hero.
          if (/node_modules\/(cobe|mini-create-react-context|phong-)/.test(id)) {
            return "vendor-globe";
          }
          // Animation engine — framer-motion + its `motion` alias. Landing
          // page relies on it heavily; app shell does not.
          if (/node_modules\/(framer-motion|motion)/.test(id)) {
            return "vendor-motion";
          }
          // Radix / base-ui primitives — dialog / popover / etc. Rarely
          // change and are reused across most pages, so caching them
          // separately pays off.
          if (/node_modules\/(@radix-ui|@base-ui|radix-ui)/.test(id)) {
            return "vendor-ui-primitives";
          }
          // React Query — data layer, stable across releases.
          if (/node_modules\/@tanstack\/react-query/.test(id)) {
            return "vendor-react-query";
          }
          // i18n runtime — i18next + bindings + locale resources.
          if (/node_modules\/(i18next|react-i18next)/.test(id)) {
            return "vendor-i18n";
          }
          // Router — small but churns rarely, worth its own slot.
          if (/node_modules\/react-router/.test(id)) {
            return "vendor-router";
          }
          // Icon set — lucide-react is tree-shaken per-icon but the util
          // runtime is shared.
          if (/node_modules\/lucide-react/.test(id)) {
            return "vendor-icons";
          }
          // Core React last so the specific matches above win first.
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return "vendor-react";
          }
          // Everything else (axios, zustand, sonner, class-variance-authority,
          // tailwind-merge, clsx, cva, small utility libs) collapses into
          // one "rest" bucket.
          return "vendor-misc";
        },
      },
    },
  },
})

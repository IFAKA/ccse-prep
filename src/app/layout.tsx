import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./native-first-ui/core.css";
import "./ui.css";
import "./animations.css";
export const metadata:Metadata={metadataBase:new URL("https://ccse-prep.vercel.app"),title:{default:"CCSE Prep 2026 · Preparación CCSE",template:"%s · CCSE Prep 2026"},description:"Tutor offline para preparar las 300 preguntas oficiales del CCSE 2026, con mocks, repaso adaptativo y sincronización local.",keywords:["CCSE 2026","preguntas CCSE","examen nacionalidad española","preparación CCSE","test CCSE"],applicationName:"CCSE Prep 2026",manifest:"/manifest.webmanifest",alternates:{canonical:"/"},openGraph:{type:"website",locale:"es_ES",url:"/",siteName:"CCSE Prep 2026",title:"CCSE Prep 2026 · Preparación CCSE",description:"Estudia las 300 preguntas oficiales del CCSE 2026 offline y a tu ritmo."},twitter:{card:"summary",title:"CCSE Prep 2026 · Preparación CCSE",description:"Tutor offline para las 300 preguntas oficiales del CCSE 2026."},robots:{index:true,follow:true}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:[{media:"(prefers-color-scheme: light)",color:"#f2f2f7"},{media:"(prefers-color-scheme: dark)",color:"#000000"}],colorScheme:"light dark"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>}

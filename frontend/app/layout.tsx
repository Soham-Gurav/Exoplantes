import "./globals.css";
import { Orbitron, Space_Grotesk } from "next/font/google";
import Navbar from "@/components/Navbar";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "700"] });

export const metadata = {
  title: "Exoplanet Classifier",
  description: "ML-powered exoplanet prediction UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} ${grotesk.className}`} >
        <Navbar />
        <main className="pt-2 overflow-hidden" style={{ overflow: "hidden" }}>{children}</main>
      </body>
    </html>
  );
}

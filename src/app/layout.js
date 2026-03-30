import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import AuthSessionProvider from "@/components/AuthSessionProvider";
import AppToaster from "@/components/AppToaster";

export const metadata = {
  title: "Eco Vigyan Foundation",
  description: "Eco Vigyan Foundation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased min-h-screen flex flex-col font-sans"
      >
        <AuthSessionProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AppToaster/>
          </AuthProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}


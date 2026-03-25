import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "TaskManager Pro",
  description: "Gestiona tus tareas de manera eficiente con autenticación JWT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
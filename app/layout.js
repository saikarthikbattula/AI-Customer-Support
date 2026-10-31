import "./globals.css";
export const metadata = {
  title: "Headstarter / Support studio",
  description: "Helpful answers, grounded in a transparent knowledge base.",
};
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

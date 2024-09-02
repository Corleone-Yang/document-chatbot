import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Documents Chatbot App",
  description: "Powered by AWS Bedrock API and Pinecone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/logo.jpg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

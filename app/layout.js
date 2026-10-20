export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Simulate a browser without service workers (e.g. an iOS in-app
            WKWebView) by removing the property before the app hydrates. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if (new URLSearchParams(location.search).has('nosw')) delete Navigator.prototype.serviceWorker;",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: '优质商品 一站购齐',
  description: '欢迎访问我们的商店',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}

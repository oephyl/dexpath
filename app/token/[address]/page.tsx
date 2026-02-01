import TokenDetailClient from "@/components/token-detail-client"

export default async function TokenDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
  return <TokenDetailClient address={address} />
}
